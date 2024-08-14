import bcrypt from "bcrypt";
import express, { Request, Response } from "express";

import {
  authenticateToken,
  generateAccessToken,
  getUserInfo,
} from "../functions/jwt";
import metrics from "../metrics";
import { logRequest } from "../middlewear/logRequest";
import { stripeMeter } from "../middlewear/stripeMeter";
import { prisma } from "../prisma";
import { createCustomer, getCustomerUsage } from "../stripe";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

let saltRounds = 10;

/**
 * User w/ Name
 * @typedef {object} User
 * @property {string} name.required - The name of the user
 * @property {string} email.required - The email of the user
 * @property {string} password.required - The password of the user
 */
type User = {
  name: string;
  email: string;
  password: string;
};

/**
 * POST /user/signup
 * @summary Sign up a user for the api
 * @tags User - User Management / Info and Authentication endpoints.
 * @param {User} request.body.required - User information
 * @return {object} 200 - Success message
 * @return {object} 400 - Error message
 * @example response - 200 - Success message
 * {
 *  "token": "token",
 *  "uuid": "uuid"
 * }
 * @example response - 400 - Error message
 * "Invalid email or password"
 *
 */
router.post("/signup", async (req, res) => {
  metrics.increment("endpoint.user.signup");

  const body = req.body;

  const { name, email, password } = body;

  if (!name || !email || !password) {
    res
      .status(400)
      .json("Invalid arguments. Please provide name, email, and password");
  }

  // check if the user already exists
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    res.status(400).json("User with that email already exists");
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  let passHash = await bcrypt.hash(password, salt);

  let customer = await createCustomer(email, name);
  let stripeCustomerId = customer.id;

  // create the user
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: passHash,
      stripeCustomerId: stripeCustomerId,
    },
  });

  res.status(200).json({
    message: "User created successfully, please login.",
    uuid: newUser.uuid,
  });
});

/**
 * User Login
 * @typedef {object} UserLogin
 * @property {string} email.required - The email of the user
 * @property {string} password.required - The password of the user
 */
type UserLogin = {
  email: string;
  password: string;
};

/**
 * POST /user/login
 * @summary Log in a user to the api
 * @tags User - User Management / Info and Authentication endpoints.
 * @param {UserLogin} request.body.required - User information
 * @return {object} 200 - Success message
 * @return {object} 400 - Error message
 * @example response - 200 - Success message
 * {
 *  "token": "token",
 *  "uuid": "uuid"
 * }
 * @example response - 400 - Error message
 * "Invalid email or password"
 *
 */
router.post("/login", async (req, res) => {
  metrics.increment("endpoint.user.login");

  const body = req.body;
  const { email, password } = body;

  if (!email || !password) {
    res.status(400).json("Missing email or password");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return res.status(400).json("User not found");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json("Invalid password");
  }

  let token = await generateAccessToken(user);

  res.status(200).json({
    token: token,
    uuid: user.uuid,
  });
});

/**
 * GET /user/me
 * @summary Gets your user details
 * @tags User - User Management / Info and Authentication endpoints
 * @security BearerAuth
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * {
 *   "name": "John Doe",
 *   "email": "john.doe@example.com",
 *   "uuid": "123e4567-e89b-12d3-a456-426614174000",
 *   "permission": "basic",
 *   "metrics": {
 *     "requests": {
 *       "count": 3,
 *       "methods": [
 *         {
 *           "method": "GET",
 *           "count": 3
 *         }
 *       ],
 *       "urls": [
 *         {
 *           "url": "/user/me",
 *           "count": 2
 *         },
 *         {
 *           "url": "/up",
 *           "count": 1
 *         }
 *       ]
 *     }
 *   },
 *   "accountCreated": "2024-08-14T02:11:02.626Z"
 * }
 * @example response - 400 - Error message
 * "User not found"
 */
router.get("/me", authenticateToken, stripeMeter, async (req, res) => {
  metrics.increment("endpoint.user.me");

  const userInfo = await getUserInfo(prisma, res, req);

  if (!userInfo) {
    return res.status(400).json("User not found");
  }

  // Get the count of requests made by the user
  const count = await prisma.expressRequest.count({
    where: {
      userId: userInfo!.id,
    },
  });

  // Fetch all requests made by the user
  const userRequests = await prisma.expressRequest.findMany({
    where: {
      userId: userInfo!.id,
    },
  });

  // Normalize the URLs by removing query parameters
  const normalizedRequests = userRequests.map((req) => {
    const urlWithoutQuery = req.url.split("?")[0]; // Remove query params
    return {
      ...req,
      url: urlWithoutQuery,
    };
  });

  // Group the requests by the normalized URL and count occurrences
  const requestCountsByUrl = normalizedRequests.reduce((acc, req) => {
    acc[req.url] = (acc[req.url] || 0) + 1;
    return acc;
  }, {});

  const requestUrls = Object.keys(requestCountsByUrl).map((url) => ({
    url,
    count: requestCountsByUrl[url],
  }));

  // Group by request methods using Prisma
  const groupByMethod = await prisma.expressRequest.groupBy({
    by: ["method"],
    where: {
      userId: userInfo!.id,
    },
    _count: {
      method: true,
    },
  });

  // Transform the data to a more readable format
  const requestMethods = groupByMethod.map((methodGroup) => ({
    method: methodGroup.method,
    count: methodGroup._count.method,
  }));

  res.status(200).json({
    name: userInfo.name,
    email: userInfo.email,
    uuid: userInfo.uuid,
    permission: userInfo.permission,
    metrics: {
      requests: {
        count: count,
        methods: requestMethods,
        urls: requestUrls,
      },
    },
    accountCreated: userInfo.createdAt,
  });
});

/**
 * GET /user/stripe/usage
 * @summary Gets your stripe usage details
 * @tags User - User Management / Info and Authentication endpoints.
 * @security BearerAuth
 * @return {object} 200 - Success message
 * @return {object} 400 - Error message
 * @example response - 200 - Success message
 * {
 *  "data": "data"
 * }
 * @example response - 400 - Error message
 * "User not found"
 *
 */
router.get(
  "/stripe/usage",
  authenticateToken,
  async (req: Request, res: Response) => {
    metrics.increment("endpoint.user.stripe.usage");

    let data = await getCustomerUsage(prisma, req, res);

    res.status(200).json(data);
  },
);

export default router;

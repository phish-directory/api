import bcrypt from "bcrypt";
import express from "express";

import { logRequest } from "../middleware/logRequest";
import {
  authenticateToken,
  generateAccessToken,
  getUserInfo,
} from "../utils/jwt";
import postmark from "../utils/postmark";
import { prisma } from "../utils/prisma";
import { userNeedsExtendedData } from "../utils/userNeedsExtendedData";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

let saltRounds = 10;

/**
 * POST /user/signup
 * @summary Create a new user account
 * @tags User - User Management / Info and Authentication endpoints
 * @param {User} request.body.required - User signup information
 * @return {object} 200 - Success response with UUID
 * @return {object} 400 - Validation error
 * @produces application/json
 * @example request - Example signup request
 * {
 *   "name": "John Doe",
 *   "email": "john.doe@example.com",
 *   "password": "securepassword123",
 * }
 * @example response - 200 - Success response
 * {
 *   "message": "User created successfully, please login.",
 *   "uuid": "123e4567-e89b-12d3-a456-426614174000"
 * }
 */
router.post("/signup", async (req, res) => {
  // metrics.increment("endpoint.user.signup");
  const body = req.body;
  const { name, email, password } = body;

  if (!name || !email || !password) {
    res
      .status(400)
      .json("Invalid arguments. Please provide name, email, and password");
    return;
  }

  // Check if the user already exists
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    res.status(400).json("User with that email already exists");
    return;
  }

  const salt = bcrypt.genSaltSync(saltRounds);
  let passHash = await bcrypt.hash(password, salt);

  try {
    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: passHash,
      },
    });

    // Send welcome email after user is created
    await postmark.sendEmailWithTemplate({
      From: "bot@phish.directory",
      To: newUser.email,
      TemplateAlias: "welcome",
      TemplateModel: {
        product_url: "https://api.phish.directory",
        product_name: "Phish Directory API",
        name: newUser.name,
        email: newUser.email,
        company_name: "Phish Directory",
        company_address: "36 Old Quarry Rd, Fayston, VT 05673",
      },
    });

    // Send success response with the user's uuid
    res.status(200).json({
      message: "User created successfully, please login.",
      uuid: newUser.uuid,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
});

/**
 * POST /user/login
 * @summary Authenticate user and get JWT token
 * @tags User - User Management / Info and Authentication endpoints
 * @param {object} request.body.required - User login credentials
 * @return {object} 200 - JWT token and user UUID
 * @return {object} 400 - Invalid credentials
 * @return {object} 403 - Account deleted
 * @produces application/json
 * @example request - Login request
 * {
 *   "email": "john.doe@example.com",
 *   "password": "securepassword123"
 * }
 * @example response - 200 - Successful login
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIs...",
 *   "uuid": "123e4567-e89b-12d3-a456-426614174000"
 * }
 */
router.post("/login", async (req, res) => {
  // metrics.increment("endpoint.user.login");

  let useExteded = await userNeedsExtendedData(req);

  const body = req.body;
  const { email, password } = body;

  if (!email || !password) {
    res.status(400).json("Missing email or password");
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return res.status(400).json("Invalid email or password");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json("Invalid email or password");
  }

  if (user.deleted === true) {
    return res
      .status(403)
      .json(
        "User has been deleted. Please contact support if you believe this is an error or need to reactivate your account."
      );
  }

  let token = await generateAccessToken(user);

  let jsonresponsebody = {};

  if (useExteded) {
    jsonresponsebody = {
      token: token,
      uuid: user.uuid,
    };
  } else {
    jsonresponsebody = {
      token: token,
    };
  }

  res.status(200).json(jsonresponsebody);
});

/**
 * GET /user/me
 * @summary Get authenticated user profile and metrics
 * @tags User - User Management / Info and Authentication endpoints
 * @security BearerAuth
 * @return {object} 200 - User profile with usage metrics
 * @return {object} 400 - User not found
 * @produces application/json
 * @example response - 200 - Profile response
 * {
 *   "name": "John Doe",
 *   "email": "john.doe@example.com",
 *   "uuid": "123e4567-e89b-12d3-a456-426614174000",
 *   "permission": "basic",
 *   "accountType": "user",
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
 *         }
 *       ]
 *     }
 *   },
 *   "accountCreated": "2024-08-14T02:11:02.626Z"
 * }
 */
router.get("/me", authenticateToken, async (req, res) => {
  // metrics.increment("endpoint.user.me");

  const userInfo = await getUserInfo(req);

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
    extendedData: userInfo.useExtendedData,
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
 * PATCH /user/me
 * @summary Update authenticated user profile
 * @description Update user details (name, password). Email updates require contacting support.
 * Only include fields that need updating. Password updates require current password verification.
 * @tags User - User Management / Info and Authentication endpoints
 * @security BearerAuth
 * @param {object} request.body - Fields to update
 * @param {string} [request.body.name] - New display name
 * @param {string} [request.body.password] - New password (requires verification)
 * @return {string} 200 - Update success message
 * @return {string} 400 - Update error message
 * @produces application/json
 * @example request - Name update
 * {
 *   "name": "John Smith"
 * }
 * @example request - Password update
 * {
 *   "password": "newSecurePassword123"
 * }
 * @example response - 200 - Success message
 * "User updated successfully"
 */
router.patch("/me", authenticateToken, async (req, res) => {
  // metrics.increment("endpoint.user.me.patch");

  const userInfo = await getUserInfo(req);

  if (!userInfo) {
    return res.status(400).json("User not found");
  }

  const { name, password } = req.body;

  if (!name && !password) {
    return res.status(400).json("No fields to update");
  }

  if (name) {
    await prisma.user.update({
      where: {
        id: userInfo.id,
      },
      data: {
        name: name,
      },
    });
  }

  if (password) {
    const valid = await bcrypt.compare(password, userInfo.password);
    if (!valid) {
      return res.status(400).json("Invalid password");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: {
        id: userInfo.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  res.status(200).json("User updated successfully");
});

export default router;

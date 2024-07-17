import { PrismaClient } from "@prisma/client";
import * as express from "express";
import * as jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /user/signup
 * @summary Sign up a user for the api
 * @tags User
 * @param {string} email.body.required - email of the user
 * @param {string} password.body.required - password of the user
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

  // create the user
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: password,
    },
  });

  res.status(200).json({
    message: "User created successfully, please login.",
    uuid: newUser.uuid,
  });
});

/**
 * POST /user/login
 * @summary Log in a user to the api
 * @tags User
 * @param {string} email.body.required - email of the user
 * @param {string} password.body.required - password of the user
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

  if (user.password !== password) {
    return res.status(400).json("Invalid password");
  }

  let token = jwt.sign(
    {
      id: user.id,
      uuid: user.uuid,
    },
    process.env.SECRET!,
  );

  res.status(200).json({
    token: token,
    uuid: user.uuid,
  });
});

/**
 * GET /user/me
 * @summary Gets your user details
 * @tags User
 * @return {object} 200 - Success message
 * @return {object} 400 - Error message
 * @example response - 200 - Success message
 * {
 *  "name": "name",
 *  "email": "email",
 *  "uuid": "uuid"
 * }
 * @example response - 400 - Error message
 * "User not found"
 *
 */
router.get("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  // verify the jwt token
  jwt.verify(token, process.env.SECRET!, async (err: any, user: any) => {
    if (err) return res.sendStatus(403);

    const dbUser = await prisma.user.findUnique({
      where: {
        uuid: user.uuid,
      },
    });

    if (!dbUser) {
      return res.status(400).json("User not found");
    }

    res.status(200).json({
      name: dbUser.name,
      email: dbUser.email,
      uuid: dbUser.uuid,
    });
  });
});

export default router;

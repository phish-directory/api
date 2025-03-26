import disposableEmailDetector from "@jaspermayone/disposable-email-detector";
import { sInvite } from "@prisma/client";
import bcrypt from "bcrypt";
import express from "express";

import { inviteToSlack } from "../func/slackInvite";
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

  let isDisposable = await disposableEmailDetector(email as string);

  if (isDisposable) {
    res.status(400).json("Disposable email addresses are not allowed");
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

    if (
      process.env.NODE_ENV === "production" ||
      process.env.SEND_DEV_EMAILS === "true"
    ) {
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
        MessageStream: "api-transactional",
      });

      postmark.sendEmail({
        From: "bot@phish.directory",
        To: "team@phish.directory",
        Subject: "New User Signup",
        // email the team and provide name, and email of the new user,
        HtmlBody: `<html><body><h1>New User Signup</h1><p>Name: ${newUser.name}</p><p>Email: ${newUser.email}</p></body></html>`,
        MessageStream: "api-transactional",
      });

      // Handle Slack invite asynchronously with 5-minute delay
      setTimeout(async () => {
        try {
          const response = await inviteToSlack(newUser.email);
          if (response.success !== true) {
            console.error(
              `Failed to invite ${newUser.email} to Slack: ${response.data.error}`
            );

            await postmark.sendEmail({
              From: "bot@phish.directory",
              To: "jasper.mayone@phish.directory",
              Subject: "Failed Slack Invite",
              TextBody: `Failed to invite ${newUser.email} to Slack: ${response.data.error}`,
              MessageStream: "api-transactional",
            });
          } else {
            await db.update(users).set({
              invitedToSlack: true,
              // @ts-expect-errorß
            }).where(eq(users.id, newUser.id));
          }
        } catch (error) {
          console.error(`Error sending Slack invite to ${newUser.email}:`, error);
        }
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
    }

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

  // Get IP address from the request
  const ipAddress =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    "0.0.0.0";

  // Get detailed IP information from ipgeolocation.io
  let ipInfo = {
    ip: ipAddress,
    timestamp: new Date().toISOString(),
    userAgent: req.headers["user-agent"] || "Unknown",
    country: null,
    city: null,
    region: null,
    location: null,
    isp: null,
    organization: null,
  };

  try {
    const API_KEY = process.env.IPGEOLOCATION_API_KEY; // Store your API key in environment variables
    const geoResponse = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ipAddress}`
    );

    if (geoResponse.ok) {
      const geoData = await geoResponse.json();

      // Update ipInfo with data from the API
      ipInfo = {
        ...ipInfo,
        country: geoData.country_name,
        countryCode: geoData.country_code2,
        city: geoData.city,
        region: geoData.state_prov,
        regionCode: geoData.state_code,
        zipcode: geoData.zipcode,
        // @ts-expect-error
        location: {
          lat: geoData.latitude,
          lng: geoData.longitude,
        },
        isp: geoData.isp,
        organization: geoData.organization,
        timezone: geoData.time_zone?.name,
        currency: geoData.currency?.code,
      };
    }
  } catch (error) {
    console.error("Failed to fetch IP geolocation data:", error);
    // Continue with basic IP info if geolocation lookup fails
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

  // Store login attempt with IP information
  try {
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        ipAddress: ipAddress as string,
        userAgent: ipInfo.userAgent,
        successful: true,
        ipInfo: JSON.stringify(ipInfo),
      },
    });
  } catch (error) {
    console.error("Failed to log login attempt:", error);
    // Continue with login process even if logging fails
  }

  let token = await generateAccessToken(user);

  let jsonresponsebody = {};

  if (
    process.env.NODE_ENV === "production" ||
    process.env.SEND_DEV_EMAILS === "true"
  ) {
    // Update the email to include comprehensive IP address information
    await postmark.sendEmail({
      From: "bot@phish.directory",
      To: user.email,
      Subject: "Phish Directory API Login",
      HtmlBody: `<html><body>
      <h1>Hello ${user.name}</h1>
      <p>You have successfully logged in to the Phish Directory API.</p>
      <p>Login details:</p>
      <ul>
        <li>Time: ${ipInfo.timestamp}</li>
        <li>IP Address: ${ipInfo.ip}</li>
        <li>Device: ${ipInfo.userAgent}</li>
        ${
          ipInfo.city
            ? // @ts-expect-error
              `<li>Location: ${ipInfo.city}, ${ipInfo.region} ${ipInfo.countryCode}</li>`
            : ""
        }
        ${
          ipInfo.organization
            ? `<li>Organization: ${ipInfo.organization}</li>`
            : ""
        }
        ${ipInfo.isp ? `<li>Internet Provider: ${ipInfo.isp}</li>` : ""}
      </ul>
      <p>If this wasn't you, please contact <a href="mailto:security@phish.directory">security@phish.directory</a> immediately AND change your password.</p>
    </body></html>`,
      MessageStream: "api-transactional",
    });
  }

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

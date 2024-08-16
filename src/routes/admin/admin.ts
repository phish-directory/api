import moment from "moment";
import bcrypt from "bcrypt";
import express, { Request, Response } from "express";

import { authenticateToken, getUserInfo } from "../../functions/jwt";
import metrics from "../../metrics";
import { logRequest } from "../../middlewear/logRequest";
import { prisma } from "../../prisma";
import { createCustomer } from "../../stripe";
import type { User } from "../../types/enums";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(authenticateToken);
router.use(logRequest);

let saltRounds = 10;

// middleware to check if the user is an admin
router.use(async (req, res, next) => {
  let user = await getUserInfo(prisma, res, req);

  if (user.permission !== "admin") {
    res.status(403).json({
      error: "You do not have permission to access this endpoint",
    });
    return;
  } else {
    next();
  }
});

/**
 * GET /admin/metrics
 * @summary Returns ADVANCED metrics / information about the API for administrators.
 * @description Get the status, environment, uptime, date started, versions, and counts of various metrics.
 * @tags Misc - Miscellaneous endpoints
 * @security BearerAuth
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "status": "up",
 *   "environment": "production",
 *   "uptime": "00:00:00",
 *   "dateStarted": "01-01-21 00:00:00 AM +00:00",
 *   "versions": {
 *     "api": "1.0.0",
 *     "node": "v14.17.0",
 *     "packages": {
 *       "express": "4.17.1",
 *       "prisma": "2.28.0",
 *       "axios": "0.21.1",
 *       "cron": "1.8.2",
 *       "helmet": "4.6.0",
 *       "jsonwebtoken": "8.5.1"
 *     }
 *   },
 *   "counts": {
 *     "domains": 0,
 *     "users": 0,
 *     "requests": {
 *       "lifetime": 0,
 *       "today": 0,
 *       "24 hours": 0,
 *       "week": 0,
 *       "month": 0,
 *       "year": 0
 *     },
 *     "responses": {
 *       "googleSafebrowsing": 0,
 *       "ipQualityScore": 0,
 *       "phisherman": 0,
 *       "phishObserver": 0,
 *       "phishReport": 0,
 *       "securityTrails": 0,
 *       "sinkingYahts": 0,
 *       "urlScan": 0,
 *       "virusTotal": 0,
 *       "walshy": 0
 *     }
 *   }
 * }
 */
router.get("/metrics", async (req, res) => {
  metrics.increment("endpoint.misc.metrics");

  let uptime = process.uptime();
  // format the uptime
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);

  let dateStarted = new Date(Date.now() - uptime * 1000);
  // format the date started with moment
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");

  let domainCount = await prisma.domain.count();
  let userCount = await prisma.user.count();
  let requestCount = await prisma.expressRequest.count();

  let npmVersion = process.env.npm_package_version;
  let expressVersion = process.env.npm_package_dependencies_express;
  let prismaVersion = process.env.npm_package_dependencies_prisma;
  let axiosVersion = process.env.npm_package_dependencies_axios;
  let cronVersion = process.env.npm_package_dependencies_cron;
  let helmetVersion = process.env.npm_package_dependencies_helmet;
  let jsonwebtokenVersion = process.env.npm_package_dependencies_jsonwebtoken;
  let nodeVersion = process.version;

  const requestsCount = await prisma.expressRequest.count();

  let environment = process.env.NODE_ENV;

  res.status(200).json({
    status: "up",
    environment: environment,
    uptime: uptimeString,
    dateStarted: dateStartedFormatted,
    versions: {
      api: npmVersion,
      node: nodeVersion,
      packages: {
        express: expressVersion,
        prisma: prismaVersion,
        axios: axiosVersion,
        cron: cronVersion,
        helmet: helmetVersion,
        jsonwebtoken: jsonwebtokenVersion,
      },
    },
    counts: {
      domains: domainCount,
      users: userCount,
      requests: {
        lifetime: requestCount,
        today: await prisma.expressRequest.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        "24 hours": await prisma.expressRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        week: await prisma.expressRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        month: await prisma.expressRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        year: await prisma.expressRequest.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      },
      responses: {
        googleSafebrowsing: await prisma.googleSafeBrowsingAPIResponse.count(),
        ipQualityScore: await prisma.ipQualityScoreAPIResponse.count(),
        phisherman: await prisma.phishermanAPIResponse.count(),
        phishObserver: await prisma.phishObserverAPIResponse.count(),
        phishReport: await prisma.phishReportAPIResponse.count(),
        securityTrails: await prisma.securityTrailsAPIResponse.count(),
        sinkingYahts: await prisma.sinkingYachtsAPIResponse.count(),
        urlScan: await prisma.urlScanAPIResponse.count(),
        virusTotal: await prisma.virusTotalAPIResponse.count(),
        walshy: await prisma.walshyAPIResponse.count(),
      },
    },
  });
});

/**
 * GET /admin/users
 * @summary Returns a list of all users.
 * @tags Users - Operations about user
 * @security BearerAuth
 * @return {object} 200 - An array of user objects.
 * @example response - 200 - An array of user objects.
 * [
 *   {
 *     "id": 1,
 *     "email": "
 *     "role": "user",
 *     "createdAt": "2021-08-01T00:00:00.000Z",
 *     "updatedAt": "2021-08-01T00:00:00.000Z",
 *     "deleted": false,
 *     "deletedAt": null
 *   }
 * ]
 */
router.get("/users", async (req, res) => {
  metrics.increment("endpoint.admin.users.get");
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

/**
 * GET /admin/user/:id
 * @summary Returns a user by their ID.
 * @tags Users - Operations about user
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to retrieve.
 * @return {object} 200 - A user object.
 * @example response - 200 - A user object.
 * {
 *   "id": 1,
 *   "email": "",
 *   "role": "user",
 *   "createdAt": "2021-08-01T00:00:00.000Z",
 *   "updatedAt": "2021-08-01T00:00:00.000Z",
 *   "deleted": false,
 *   "deletedAt": null
 * }
 */
router.get("/user/:id", async (req, res) => {
  metrics.increment("endpoint.admin.user.get");
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});

/**
 * DELETE /admin/user/:id
 * @summary Deletes a user by their ID.
 * @tags Users - Operations about user
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to delete.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User deleted successfully."
 * }
 */
router.delete("/user/:id", async (req, res) => {
  metrics.increment("endpoint.admin.user.delete");
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        deletedAt: new Date(),
        deleted: true,
      },
    });

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});

/**
 * PATCH /admin/user/:id
 * @summary Updates a user by their ID.
 * @tags Users - Operations about user
 * @security BearerAuth
 * @param {number} id.path - The ID of the user to update.
 * @param {object} user.body.required - The user object to update.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User updated successfully."
 * }
 */
router.patch("/user/:id", async (req, res) => {
  metrics.increment("endpoint.admin.user.patch");
  try {
    const { id } = req.params;
    const { email, password, permission } = req.body;

    // Build the data object dynamically
    const updateData = {};
    // @ts-expect-error
    if (email !== undefined) updateData.email = email;
    // @ts-expect-error
    if (password !== undefined) updateData.password = password;
    // @ts-expect-error
    if (permission !== undefined) updateData.permission = permission;

    // Update user
    await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

    res.status(200).json({
      message: "User updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred.",
    });
  }
});

/**
 * POST /admin/user/new
 * @summary Creates a new user.
 * @tags Users - Operations about user
 * @security BearerAuth
 * @param {User} user.body.required - The user object to create.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *   "message": "User created successfully."
 * }
 */
router.post("/user/new", async (req, res) => {
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

  let customer = await createCustomer(email, name);
  let stripeCustomerId = customer.id;

  // Create the user
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

export default router;

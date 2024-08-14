import * as express from "express";
import moment from "moment";

import { logRequest } from "../middlewear/logRequest";
import { prisma } from "../prisma";
import metrics from "../metrics";
import { authenticateToken } from "../functions/jwt";
import { getUserInfo } from "../functions/jwt";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(authenticateToken);
router.use(logRequest);

// middleware to check if the user is an admin
router.use(async (req, res, next) => {
  let user = await getUserInfo(prisma, res, req);

  console.log(user);

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
 * @tags Admin - Endpoints restricted to API administrators.
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
 * DELETE /admin/user/:id
 * @summary Deletes a user by their ID.
 * @tags Admin - Endpoints restricted to API administrators.
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

export default router;

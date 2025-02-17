import express from "express";
import moment from "moment";
import { getPackageVersion, getVersion } from "../../functions/getVersion";
import { authenticateToken, getUserInfo } from "../../functions/jwt";
import { logRequest } from "../../middleware/logRequest";
import { prisma } from "../../prisma";
import domainRouter from "./routes/domain";
import userRouter from "./routes/user";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(authenticateToken);

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
 * @summary Get comprehensive system metrics
 * @description Provides detailed system information and metrics for administrators including:
 * - System status and environment details
 * - Runtime information (uptime, start time)
 * - Version information for API and all dependencies
 * - Usage statistics across different time periods
 * - API integration response counts
 * @security BearerAuth
 * @return {object} 200 - Detailed metrics response
 * @return {object} 403 - Permission denied
 * @produces application/json
 * @example response - 200 - Complete metrics response
 * {
 *   "status": "up",
 *   "environment": "production",
 *   "uptime": "48:12:33",
 *   "dateStarted": "01-09-24 9:45:27 AM +00:00",
 *   "versions": {
 *     "api": "2.0.0",
 *     "node": "v18.17.0",
 *     "packages": {
 *       "express": "4.18.2",
 *       "prisma": "5.4.2",
 *       "axios": "1.5.0",
 *       "cron": "2.4.3",
 *       "helmet": "7.0.0",
 *       "jsonwebtoken": "9.0.2"
 *     }
 *   },
 *   "counts": {
 *     "domains": 1234,
 *     "users": 567,
 *     "requests": {
 *       "lifetime": 50000,
 *       "today": 1500,
 *       "24 hours": 1800,
 *       "week": 12000,
 *       "month": 45000,
 *       "year": 500000
 *     },
 *     "responses": {
 *       "googleSafebrowsing": 45000,
 *       "ipQualityScore": 42000,
 *       "phishObserver": 35000,
 *       "phishReport": 30000,
 *       "securityTrails": 25000,
 *       "sinkingYahts": 20000,
 *       "urlScan": 15000,
 *       "virusTotal": 10000,
 *       "walshy": 5000
 *     }
 *   }
 * }
 * @example response - 403 - Permission denied
 * {
 *   "error": "You do not have permission to access this endpoint"
 * }
 */
router.get("/metrics", logRequest, async (req, res) => {
  // // metrics.increment("endpoint.misc.metrics");

  let uptime = process.uptime();
  // format the uptime
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);

  let dateStarted = new Date(Date.now() - uptime * 1000);
  // format the date started with moment
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");

  let domainCount = await prisma.domain.count();
  let userCount = await prisma.user.count();
  let requestCount = await prisma.expressRequest.count();

  let npmVersion = getVersion();
  let expressVersion = getPackageVersion("express");
  let prismaVersion = getPackageVersion("@prisma/client");
  let axiosVersion = getPackageVersion("axios");
  let cronVersion = getPackageVersion("cron");
  let helmetVersion = getPackageVersion("helmet");
  let jsonwebtokenVersion = getPackageVersion("jsonwebtoken");
  let nodeVersion = process.version;

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
        googleSafebrowsing: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "SafeBrowsing", // Changed from APIs.SafeBrowsing
          },
        }),
        ipQualityScore: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "IpQualityScore",
          },
        }),
        phishObserver: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "PhishObserver",
          },
        }),
        phishReport: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "PhishReport",
          },
        }),
        securityTrails: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "SecurityTrails",
          },
        }),
        sinkingYahts: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "SinkingYachts",
          },
        }),
        urlScan: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "UrlScan",
          },
        }),
        virusTotal: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "VirusTotal",
          },
        }),
        walshy: await prisma.rawAPIData.count({
          where: {
            sourceAPI: "Walshy",
          },
        }),
      },
    },
  });
});

/**
 * Admin Router Configuration
 * @summary Administrative route handler with authentication and permission checks
 * @description All routes under /admin require:
 * 1. Valid JWT authentication token
 * 2. Admin-level permissions
 * Sub-routes include:
 * - /admin/metrics: System metrics and statistics
 * - /admin/domain: Domain management
 * - /admin/user: User management
 */
router.use("/domain", logRequest, domainRouter);
router.use("/user", userRouter);

export default router;

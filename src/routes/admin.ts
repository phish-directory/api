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
 * @summary Get the uptime and date started of the API
 * @tags Miscalleanous
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *  "status": "up",
 * "uptime": "00:00:00",
 * "dateStarted": "01-01-21 0:0:0 AM +00:00"
 * }
 *
 */
router.get("/metrics", authenticateToken, async (req, res) => {
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

  let enviornment = process.env.NODE_ENV;

  res.status(200).json({
    status: "up",
    enviornment: enviornment,
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

export default router;

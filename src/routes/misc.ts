import { PrismaClient } from "@prisma/client";
import * as express from "express";
import moment from "moment";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /misc/metrics
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
router.get("/metrics", async (req, res) => {
  let uptime = process.uptime();
  // format the uptime
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);

  let dateStarted = new Date(Date.now() - uptime * 1000);
  // format the date started with moment
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");

  let domainCount = await prisma.domain.count();
  let userCount = await prisma.user.count();
  let requestCount = await prisma.expressRequest.count();

  res.status(200).json({
    status: "up",
    uptime: uptimeString,
    dateStarted: dateStartedFormatted,
    domainCount: domainCount,
    userCount: userCount,
    requests: {
      lifetime: requestCount,
      today: await prisma.expressRequest.count({
        where: {
          dateCreated: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      "24 hours": await prisma.expressRequest.count({
        where: {
          dateCreated: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      week: await prisma.expressRequest.count({
        where: {
          dateCreated: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      month: await prisma.expressRequest.count({
        where: {
          dateCreated: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      year: await prisma.expressRequest.count({
        where: {
          dateCreated: {
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
      sinkingYahts: await prisma.sinkingYachtsAPIResponse.count(),
      virusTotal: await prisma.virusTotalAPIResponse.count(),
      walshy: await prisma.walshyAPIResponse.count(),
    },
  });
});

export default router;

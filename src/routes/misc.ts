import * as express from "express";
import moment from "moment";

import metrics from "../metrics";
import { logRequest } from "../middlewear/logRequest";
import { prisma } from "../prisma";
import { getVersion } from "../functions/getVersion";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

/**
 * GET /misc/metrics
 * @summary Returns basic metrics / information about the API for users.
 * @description Basic information about the API, such as status, environment, uptime, date started, version, and domain count.
 * @tags Miscalleanous - Endpoints that don't fit into any other category.
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 *  "status": "up",
 * "environment": "production",
 * "uptime": "00:00:00",
 * "dateStarted": "01-01-21 0:0:0 AM +00:00",
 * "version": "1.0.0",
 * "domains": 0
 * }
 *
 */
router.get("/metrics", async (req, res) => {
  metrics.increment("endpoint.misc.metrics");

  let uptime = process.uptime();
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);
  let dateStarted = new Date(Date.now() - uptime * 1000);
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");
  let domainCount = await prisma.domain.count();
  let npmVersion = getVersion();
  let environment = process.env.NODE_ENV;

  res.status(200).json({
    status: "up",
    environment: environment,
    uptime: uptimeString,
    dateStarted: dateStartedFormatted,
    version: npmVersion,
    domains: domainCount,
  });
});

export default router;

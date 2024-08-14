import * as express from "express";
import moment from "moment";

import metrics from "../metrics";
import { logRequest } from "../middlewear/logRequest";
import { prisma } from "../prisma";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

/**
 * GET /misc/metrics
 * @summary Get the uptime and date started of the API
 * @tags Miscalleanous - Endpoints that don't fit into any other category.
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
  metrics.increment("endpoint.misc.metrics");

  let uptime = process.uptime();
  // format the uptime
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);
  let dateStarted = new Date(Date.now() - uptime * 1000);
  // format the date started with moment
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");
  let domainCount = await prisma.domain.count();
  let npmVersion = process.env.npm_package_version;
  let enviornment = process.env.NODE_ENV;

  res.status(200).json({
    status: "up",
    enviornment: enviornment,
    uptime: uptimeString,
    dateStarted: dateStartedFormatted,
    version: npmVersion,
    domains: domainCount,
  });
});

export default router;

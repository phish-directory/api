import * as express from "express";
import moment from "moment";
import { logRequest } from "src/middleware/logRequest";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

/**
 * GET /misc/metrics
 * @summary Get API system metrics and status
 * @description Returns operational metrics and system information including:
 * - Current API status
 * - Environment (production/development)
 * - System uptime
 * - Service start timestamp
 * - API version
 * - Total number of tracked domains
 * @tags Miscellaneous - System information and metrics
 * @return {object} 200 - System metrics response
 * @produces application/json
 * @example response - 200 - Example metrics response
 * {
 *   "status": "up",
 *   "environment": "production",
 *   "uptime": "48:12:33",
 *   "dateStarted": "01-09-24 9:45:27 AM +00:00",
 *   "version": "2.0.0",
 *   "domains": 1234
 * }
 */
router.get("/metrics", async (req, res) => {
  // metrics.increment("endpoint.misc.metrics");
  let uptime = process.uptime();
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);
  let dateStarted = new Date(Date.now() - uptime * 1000);
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");
  let environment = process.env.NODE_ENV;

  res.status(200).json({
    status: "up",
    environment: environment,
    uptime: uptimeString,
    dateStarted: dateStartedFormatted,
  });
});

export default router;

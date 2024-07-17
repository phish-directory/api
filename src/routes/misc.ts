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
router.get("/metrics", (req, res) => {
  let uptime = process.uptime();
  // format the uptime
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);

  let dateStarted = new Date(Date.now() - uptime * 1000);
  // format the date started with moment
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");

  res.status(200).json({
    status: "up",
    uptime: uptimeString,
    dateStarted: dateStartedFormatted,
  });
});

export default router;

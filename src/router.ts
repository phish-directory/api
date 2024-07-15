import * as express from "express";
import moment from "moment";

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader("X-Api-Version", `${process.env.npm_package_version!}`);

  if (process.env.NODE_ENV === "production") {
    res.setHeader("X-Api-Version-Status", "stable");
  } else if (process.env.NODE_ENV === "development") {
    res.setHeader("X-Api-Version-Status", "development");
  } else {
    res.setHeader("X-Api-Version-Status", "unknown");
  }

  // set xrobots tag
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  next();
});

/**
 * GET /
 * @summary Redirect to docs
 * @tags Main API Endpoints
 * @return {string} 301 - Redirect to /docs
 * @example response - 301 - Redirect to /docs
 *  "Redirecting to /docs"
 */
router.get("/", (req, res) => {
  res.status(301).redirect("/docs");
});

/**
 * GET /metrics
 * @summary Get the uptime and date started of the API
 * @tags Main API Endpoints
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

/**
 * GET /check
 * @summary Checks if a domain is classified as something malicious (scam, phishing, etc.)
 * @tags Main API Endpoints
 * @param {string} domain.query.required - domain to check
 * @return {string} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * "Check!"
 * @example response - 400 - Error: No domain parameter
 * "No domain parameter found"
 * @example response - 400 - Error: Invalid domain parameter
 * "Invalid domain parameter, should be a top level domain. Ex: google.com, amazon.com"
 *
 */
router.get("/check", (req, res) => {
  // look for the query parameter
  const query = req.query!;

  let domain: string = query.domain! as string;

  // check for domain parameter
  if (!domain) {
    res.status(400).json("No domain parameter found");
  }

  // validate the domain (should be a top level domain
  // and not a subdomain
  // ex: google.com amazn.com
  // not: mail.google.com, docs.google.com)

  let regex = new RegExp("^[a-zA-Z0-9-]{1,63}.[a-zA-Z]{2,}$");
  if (!regex.test(domain)) {
    res
      .status(400)
      .json(
        "Invalid domain parameter, should be a top level domain. Ex: google.com, amazon.com",
      );
  }

  res.status(200).json("Check!");
});

/**
 * POST /report
 * @summary Report a domain as malicious
 * @tags Main API Endpoints
 * @return {string} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * "Report!"
 */
router.post("/report", (req, res) => {
  res.status(200).json("Report!");
});

export default router;
import * as express from "express";
import responseTime from "response-time";

// import metrics from "./metrics";
import { logRequest } from "./middleware/logRequest";
// import defaultRateLimiter from "./middleware/rateLimit";
import { sql } from "drizzle-orm";
import moment from "moment";
import adminRouter from "./admin-routes/router";
import { getVersion } from "./func/getVersion";
import domainRouter from "./routes/domain";
import emailRouter from "./routes/email";
import miscRouter from "./routes/misc";
import userRouter from "./routes/user";
import { db } from "./utils/db";

const router = express.Router();
const version = getVersion();

router.use(
  responseTime((req: express.Request, res: express.Response, time: number) => {
    const path = req.url?.split("/")[1] || "root";
    const method = req.method;
    const status = res.statusCode;

    // Clean stat key for metrics
    const stat = `${method.toLowerCase()}_${path}`
      .replace(/[:.]/g, "")
      .replace(/\//g, "_");

    // Log response time metrics
    // logger.debug(`Response time for ${method} /${path}: ${time}ms`);

    // Metrics integration (commented out but structured)
    // metrics.timing(`http.response.${stat}`, time);
    // metrics.increment(`http.response.${stat}.${status}`);

    // Log slow responses (over 1000ms)
    // if (time > 1000) {
    //   console.warn(
    //     `Slow response detected: ${method} ${req.url} took ${time}ms`
    //   );
    // }
  })
);

/**
 * GET /
 * @summary Redirect to docs
 * @tags System
 * @return {string} 301 - Redirect to /docs
 * @example response - 301 - Redirect to /docs
 *  "Redirecting to /docs"
 */
router.get("/", logRequest, (req, res) => {
  // // metrics.increment("http.request.root");
  return res.status(301).redirect("/docs");
});

router.get("/github", logRequest, (req, res) => {
  return res.status(301).redirect("https://github.com/phishdirectory/api");
});

router.get("/github/issues", logRequest, (req, res) => {
  return res
    .status(301)
    .redirect("https://github.com/phishdirectory/api/issues");
});

/**
 * GET /up
 * @summary Check if the API is up
 * @tags System
 * @return {object} 200 - Status response
 * @produces application/json
 * @example response - 200 - Success with database connection
 * {
 *   "status": "up",
 *   "timestamp": "2023-01-15T00:00:00.000Z",
 * }
 */
router.get("/up", logRequest, async (req, res) => {
  return res.status(200).json({
    status: "up",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /version
 * @summary Get the API version
 * @tags System
 * @return {object} 200 - Version response
 * @produces application/json
 * @example response - 200 - Version response
 * {
 *   "version": "1.0.0",
 *   "timestamp": "2023-01-15T00:00:00.000Z",
 * }
 */
router.get("/version", logRequest, async (req, res) => {
  return res.status(200).json({
    version,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health
 * @summary Check the health of the API
 * @tags System
 * @return {object} 200 - Health response
 * @produces application/json
 * @example response - 200 - Health response
 * {
 *  "status": "up",
 * "timestamp": "2023-01-15T00:00:00.000Z",
 * "database": {
 *  "connected": true,
 * "ping": "100ms",
 * "lastError": null
 * },
 * "uptime": 1000,
 * "memory": {
 * "rss": 1000000,
 * "heapTotal": 500000,
 * "heapUsed": 250000,
 * "external": 10000
 * }
 * }
 */
router.get("/health", logRequest, async (req, res) => {
  // Record start time for ping calculation using high-precision timer
  const startTime = performance.now();
  // Check database connectivity with a simple query
  await db.execute(sql`SELECT 1`);
  // Calculate ping time with microsecond precision
  const pingTime = Math.round((performance.now() - startTime) * 100) / 100;

  // Get memory usage and convert to MB for readability
  const memoryUsage = process.memoryUsage();
  const formatMemory = (bytes: number) =>
    Math.round((bytes / 1024 / 1024) * 100) / 100;

  let uptime = process.uptime();
  let uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);
  let dateStarted = new Date(Date.now() - uptime * 1000);
  let dateStartedFormatted = moment(dateStarted).format("MM-DD-YY H:m:s A Z");

  return res.status(200).json({
    status: "up",
    timestamp: new Date().toISOString(),
    database: {
      connected: true,
      ping: `${pingTime}ms`,
    },
    uptime: uptimeString,
    dateStarted: dateStartedFormatted,
    memory: {
      rss: `${formatMemory(memoryUsage.rss)}MB`, // Resident Set Size - total memory allocated
      heapTotal: `${formatMemory(memoryUsage.heapTotal)}MB`, // V8 heap total size
      heapUsed: `${formatMemory(memoryUsage.heapUsed)}MB`, // V8 heap used size
      external: `${formatMemory(memoryUsage.external)}MB`, // C++ objects bound to JavaScript
      arrayBuffers: `${formatMemory(memoryUsage.arrayBuffers)}MB`, // Memory used by array buffers
    },
  });
});

// Error handling middleware
router.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);

    const errorResponse = {
      status: "error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
);

router.use(express.static("public"));

/**
 * @swagger
 * tags:
 *   - name: System
 *     description: System-level endpoints for health checks and documentation
 */

/**
 * GET /docs
 * @summary API Documentation
 * @tags System
 * @description Swagger UI documentation interface for the main API
 */

/**
 * GET /admin/docs
 * @summary Admin API Documentation
 * @tags System
 * @description Swagger UI documentation interface for admin-only endpoints
 */

const routes = [
  { path: "/user", router: userRouter },
  { path: "/misc", router: miscRouter },
  { path: "/domain", router: domainRouter },
  { path: "/email", router: emailRouter },
  { path: "/admin", router: adminRouter },
];

routes.forEach(({ path, router: routeHandler }) => {
  router.use(path, logRequest, routeHandler);
});

export default router;

import * as express from "express";
import responseTime from "response-time";
// import metrics from "./metrics";
import { logRequest } from "./middleware/logRequest";
// import defaultRateLimiter from "./middleware/rateLimit";
import { prisma } from "./prisma";
import adminRouter from "./routes/admin/router";
import domainRouter from "./routes/domain";
import emailRouter from "./routes/email";
import miscRouter from "./routes/misc";
import userRouter from "./routes/user";

const router = express.Router();

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
    console.log(`Response time for ${method} /${path}: ${time}ms`);

    // Metrics integration (commented out but structured)
    // metrics.timing(`http.response.${stat}`, time);
    // metrics.increment(`http.response.${stat}.${status}`);

    // Log slow responses (over 1000ms)
    if (time > 1000) {
      console.warn(
        `Slow response detected: ${method} ${req.url} took ${time}ms`
      );
    }
  })
);

// router.use(defaultRateLimiter);

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
  res.status(301).redirect("/docs");
});

/**
 * GET /up
 * @summary Check if the API and database are up
 * @tags System
 * @return {object} 200 - Status response
 * @produces application/json
 * @example response - 200 - Success with database connection
 * {
 *   "status": "up",
 *   "database": {
 *     "connected": true,
 *     "ping": "42ms",
 *     "lastError": null
 *   }
 * }
 * @example response - 200 - Success with database error
 * {
 *   "status": "up",
 *   "database": {
 *     "connected": false,
 *     "ping": null,
 *     "lastError": {
 *       "message": "Connection refused",
 *       "timestamp": "2025-01-09T12:00:00Z"
 *     }
 *   }
 * }
 */
router.get("/up", logRequest, async (req, res) => {
  try {
    // Record start time for ping calculation
    const startTime = Date.now();
    // Check database connectivity with a simple query
    await prisma.$queryRaw`SELECT 1`;
    // Calculate ping time
    const pingTime = Date.now() - startTime;
    // Return success response with database status
    res.status(200).json({
      status: "up",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        ping: `${pingTime}ms`,
        lastError: null,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    // Return response with database error details
    res.status(200).json({
      status: "up",
      database: {
        connected: false,
        ping: null,
        lastError: {
          // @ts-expect-error
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }
});

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

export default router;

import * as express from "express";
import responseTime from "response-time";

// import metrics from "./metrics";
import { logRequest } from "./middleware/logRequest";
// import defaultRateLimiter from "./middleware/rateLimit";
import { getVersion } from "./func/getVersion";
import adminRouter from "./routes/admin/router";
import domainRouter from "./routes/domain";
import emailRouter from "./routes/email";
import miscRouter from "./routes/misc";
import userRouter from "./routes/user";
import * as logger from "./utils/logger";
import postmark from "./utils/postmark";
import { prisma } from "./utils/prisma";

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
    logger.debug(`Response time for ${method} /${path}: ${time}ms`);

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

/*
  .get(
    "/health",
    async ({}) => {
      try {
        // Record start time for ping calculation
        const startTime = Date.now();
        // Check database connectivity with a simple query
        await prisma.$queryRaw`SELECT 1`;
        // Calculate ping time
        const pingTime = Date.now() - startTime;

        return {
          status: "up",
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            ping: `${pingTime}ms`,
            lastError: null,
          },
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        };
      } catch (error) {
        logger.error(`"Error in /up", \n ${error}`);
        return {
          status: "Having errors returning data",
        };
      }
    },
    {
      tags: ["System"],
      response: {
        200: t.Object({
          status: t.String(),
          timestamp: t.String(),
          database: t.Object({
            connected: t.Boolean(),
            ping: t.String(),
            lastError: t.Null(),
          }),
          uptime: t.Number(),
          memory: t.Object({
            rss: t.Number(),
            heapTotal: t.Number(),
            heapUsed: t.Number(),
            external: t.Number(),
          }),
        }),
      },
    }
  )
  */

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
  // Record start time for ping calculation
  const startTime = Date.now();
  // Check database connectivity with a simple query
  await prisma.$queryRaw`SELECT 1`;
  // Calculate ping time
  const pingTime = Date.now() - startTime;

  return res.status(200).json({
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
});

router.get("/tmp", async (req, res) => {
  postmark
    // .sendEmail({
    //   From: "bot@phish.directory",
    //   To: "me@jaspermayone.com",
    //   Subject: "Test",
    //   HtmlBody: "<html><body><h1>Hello</h1><p>This is a test</p></body></html>",
    //   TextBody: "Hello, this is a test",
    //   TrackOpens: true,
    //   TrackLinks: LinkTrackingOptions.HtmlAndText,
    // })
    .sendEmailWithTemplate({
      From: "bot@phish.directory",
      To: "me@jaspermayone.com",
      TemplateAlias: "welcome",
      TemplateModel: {
        product_url: "https://api.phish.directory",
        product_name: "Phish Directory API",
        name: "Jasper",
        email: "me@jaspermayone.com",
        company_name: "Phish Directory",
        company_address: "36 Old Quarry Rd, Fayston, VT 05673",
      },
    })
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      console.error(error);
      res.json(error);
    });
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

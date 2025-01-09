import * as express from "express";
import responseTime from "response-time";

// import metrics from "./metrics";
import { logRequest } from "./middleware/logRequest";
import adminRouter from "./routes/admin/router";
import domainRouter from "./routes/domain";
import emailRouter from "./routes/email";
import miscRouter from "./routes/misc";
import stripeRouter from "./routes/stripe";
import userRouter from "./routes/user";
import { prisma } from "./prisma";

const router = express.Router();

router.use(
  responseTime((req: any, res: any, time: any) => {
    const stat = (req.method + "/" + req.url?.split("/")[1])
      .toLowerCase()
      .replace(/[:.]/g, "")
      .replace(/\//g, "_");

    const httpCode = res.statusCode;
    const timingStatKey = `http.response.${stat}`;
    const codeStatKey = `http.response.${stat}.${httpCode}`;
    // metrics.timing(timingStatKey, time);
    // // metrics.increment(codeStatKey, 1);
  }),
);

/**
 * GET /
 * @summary Redirect to docs
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
 * @summary Check if the API is up
 * @return {object} 200 - Success message
 * @example response - 200 - Success message
 * {
 * "status": "up"
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
      database: {
        connected: true,
        ping: pingTime,
        lastError: null,
      },
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
 * GET /docs
 * @summary Swagger UI for API documentation.
 */

/**
 * GET /admin/docs
 * @summary Swagger UI for admin API documentation.
 */

router.use("/user", userRouter);
router.use("/misc", miscRouter);
router.use("/domain", domainRouter);
router.use("/email", emailRouter);
router.use("/stripe", stripeRouter);
router.use("/admin", adminRouter);

export default router;

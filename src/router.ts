import * as express from "express";

import domainRouter from "./routes/domain";
import miscRouter from "./routes/misc";
import stripeRouter from "./routes/stripe";
import userRouter from "./routes/user";

const router = express.Router();

/**
 * GET /
 * @summary Redirect to docs
 * @return {string} 301 - Redirect to /docs
 * @example response - 301 - Redirect to /docs
 *  "Redirecting to /docs"
 */
router.get("/", (req, res) => {
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
router.get("/up", (req, res) => {
  res.status(200).json({
    status: "up",
  });
});

router.use("/user", userRouter);
router.use("/misc", miscRouter);
router.use("/domain", domainRouter);
router.use("/stripe", stripeRouter);

export default router;

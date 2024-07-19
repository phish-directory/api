import * as express from "express";

import domainRouter from "./routes/domain";
import miscRouter from "./routes/misc";
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

router.use("/user", userRouter);
router.use("/misc", miscRouter);
router.use("/domain", domainRouter);

export default router;

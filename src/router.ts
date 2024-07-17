import * as express from "express";

import { authenticateToken } from "./functions/jwt";
import domainRouter from "./routes/domain";
import miscRouter from "./routes/misc";
import userRouter from "./routes/user";

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
 * @return {string} 301 - Redirect to /docs
 * @example response - 301 - Redirect to /docs
 *  "Redirecting to /docs"
 */
router.get("/", (req, res) => {
  res.status(301).redirect("/docs");
});

router.use("/user", userRouter);
router.use("/misc", miscRouter);
router.use("/domain", authenticateToken, domainRouter);

export default router;

import { PrismaClient } from "@prisma/client";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import requestIp from "request-ip";

import domainRouter from "./routes/domain";
import miscRouter from "./routes/misc";
import userRouter from "./routes/user";

const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  let usr: string | undefined;

  // check if the authorization header is present
  if (req.headers.authorization) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(
      token,
      process.env.JWT_SECRET! as string,
      (err: any, user: any) => {
        if (err) return res.sendStatus(403);

        // set usr to the uuid of the user from the token
        usr = user.uuid;
      },
    );
  }

  let ip = requestIp.getClientIp(req)!;

  // log the request to the database (setting the user to null if not authenticated)
  prisma.expressRequest
    .create({
      data: {
        method: req.method,
        url: req.url,
        headers: req.headers as any,
        body: req.body,
        query: req.query,
        ip: ip,
        User: usr
          ? {
              connect: {
                uuid: usr,
              },
            }
          : undefined,
      },
    })
    .catch((err: any) => {
      console.error("Failed to log request to the database", err);
    });

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
router.use("/domain", domainRouter);

export default router;

import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import requestIp from "request-ip";

import { getUserInfo } from "../functions/jwt";
import { log } from "../utils/logger";
const prisma = new PrismaClient();

/**
 * Middleware to log requests to the console
 * @param req - Express Request Object
 * @param res - Express Response Object
 * @param next - Express Next Function
 */
export const logRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let userAgent = req.headers["user-agent"];
  if (userAgent) {
    userAgent = userAgent.toString();
  } else {
    userAgent = "no user-agent";
  }

  let userinfo;
  let usr;

  if (req.headers.authorization) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token != null) {
      userinfo = await getUserInfo(prisma, res, req);
      usr = userinfo.uuid;
    }
  }

  let ip = requestIp.getClientIp(req)!;

  await prisma.expressRequest
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

  log(`${req.method} ${req.url} ${userAgent}`, "log");
  next();
};

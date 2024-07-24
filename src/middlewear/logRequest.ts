import { NextFunction, Request, Response } from "express";
import requestIp from "request-ip";

import { getUserInfo } from "../functions/jwt";
import { prisma } from "../prisma";
import { log } from "../utils/logger";

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
  let method = req.method;
  let url = req.url;
  let headers = req.headers;
  let body = req.body;
  let query = req.query;

  if (req.headers.authorization) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token !== null && token !== undefined) {
      userinfo = await getUserInfo(prisma, res, req);
      if (userinfo) {
        usr = userinfo.uuid;
      }
    }
  }

  if (req.url === "/user/signup") {
    body.password = "REDACTED BY API FOR PRIVACY";
  }

  let ip = requestIp.getClientIp(req)!;

  await prisma.expressRequest
    .create({
      data: {
        method: method,
        url: url,
        headers: headers,
        body: body,
        query: query,
        ip: ip,
        userAgent: userAgent,
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

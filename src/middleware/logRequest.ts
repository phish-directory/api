import { NextFunction, Request, Response } from "express";
import requestIp from "request-ip";

import { getUserInfo } from "../functions/jwt";
import { prisma } from "../prisma";
import { log } from "../utils/logger";

let monitoringAgents = ["Checkly/", "Uptime-Kuma/"];

/**
 * Middleware to log requests to the console
 * @param req - Express Request Object
 * @param res - Express Response Object
 * @param next - Express Next Function
 * @returns void
 */
export const logRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // metrics.increment("api.requests");

  let userAgent = req.headers["user-agent"];
  if (userAgent) {
    userAgent = userAgent.toString();
  } else {
    userAgent = "";
  }

  let xIdentity = req.headers["x-identity"];
  if (xIdentity) {
    xIdentity = xIdentity.toString();
  } else {
    xIdentity = "";
  }

  if (monitoringAgents.some((agent) => userAgent.startsWith(agent))) {
    return next();
  }

  let userinfo;
  let usr;
  let method = req.method;
  let url = req.originalUrl;
  let headers = req.headers;
  let body = req.body;
  let query = req.query;

  if (req.headers.authorization) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token !== null && token !== undefined) {
      userinfo = await getUserInfo(req);
      if (userinfo) {
        usr = userinfo.uuid;
      }
    }
  }

  let ip = requestIp.getClientIp(req)!;

  // Clone the body object to avoid modifying the original request body
  let bdytmp = { ...body };

  if (url === "/user/signup") {
    // Redact password in the cloned body object
    if (bdytmp.password) {
      bdytmp.password = "REDACTED BY API FOR PRIVACY";
    }
  }

  if (url === "/user/login") {
    // Redact password in the cloned body object
    if (bdytmp.password) {
      bdytmp.password = "REDACTED BY API FOR PRIVACY";
      // bdytmp.password =
      //   bdytmp.password.slice(0, 4) +
      //   "*".repeat(bdytmp.password.length - 8) +
      //   bdytmp.password.slice(-4);
    }
  }

  await prisma.expressRequest
    .create({
      data: {
        method: method,
        url: url,
        headers: headers,
        body: bdytmp,
        query: query,
        ip: ip,
        userAgent: userAgent,
        xIdentity: xIdentity,
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

  if (process.env.NODE_ENV === "development") {
    log(`${req.method} ${req.url} ${userAgent}`, "log");
  }

  next();
};

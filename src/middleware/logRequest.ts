import { NextFunction, Request, Response } from "express";
import requestIp from "request-ip";

import { prisma } from "../prisma";
import { getUserInfo } from "../utils/jwt";
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
    // Check if it's a Bearer token with proper JWT format
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      // Basic validation that it looks like a JWT (has two dots)
      if (token && token.split(".").length === 3) {
        try {
          userinfo = await getUserInfo(req);
          // Only set usr if userinfo exists AND has a valid uuid
          if (userinfo && userinfo.uuid) {
            usr = userinfo.uuid;
          }
        } catch (error) {
          // Just log error but continue processing request without setting user values
          console.error("Error validating JWT:", error);
        }
      }
    }
  }

  let ip = requestIp.getClientIp(req)!;

  // Clone the body object to avoid modifying the original request body
  let bdytmp = { ...body };

  if (url === "/user/signup") {
    if (bdytmp.password) {
      bdytmp.password = "REDACTED BY API FOR PRIVACY";
    }
  }

  if (url === "/user/login") {
    if (bdytmp.password) {
      bdytmp.password = "REDACTED BY API FOR PRIVACY";
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

import { NextFunction, Request, Response } from "express";
import requestIp from "request-ip";

import { requestsLog } from "src/db/schema";
import { db } from "src/utils/db";
import { getUserInfo } from "src/utils/jwt";
import { log } from "src/utils/logger";

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

  const normalizedUserAgent = userAgent.toLowerCase();
  if (
    monitoringAgents.some((agent) =>
      normalizedUserAgent.includes(agent.toLowerCase())
    )
  ) {
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
        usr = userinfo.id;
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

  // await db.insert(requests).values({
  //   method: method,
  //   url: url,
  //   headers: headers,
  //   body: bdytmp,
  //   query: query,
  //   ip: ip,
  //   referer: req.headers.referer,
  //   userAgent: userAgent,
  //   xIdentity: xIdentity,
  //   userId: usr,
  // });

  await db.insert(requestsLog).values({
    method: method,
    url: url,
    headers: headers,
    body: bdytmp,
    query: query,
    ip: ip,
    referer: req.headers.referer,
    userAgent: userAgent,
    xIdentity: xIdentity,
    userId: usr,
  });

  if (process.env.NODE_ENV === "development") {
    log(`${req.method} ${req.url} ${userAgent}`, "log");
  }

  next();
};

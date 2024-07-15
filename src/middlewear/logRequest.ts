import { NextFunction, Request, Response } from "express";

import { log } from "../utils/logger";

/**
 * Middleware to log requests to the console
 * @param req - Express Request Object
 * @param res - Express Response Object
 * @param next - Express Next Function
 */
export const logRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let userAgent = req.headers["user-agent"];
  if (userAgent) {
    userAgent = userAgent.toString();
  } else {
    userAgent = "no user-agent";
  }

  log(`${req.method} ${req.url} ${userAgent}`, "log");
  next();
};

import { NextFunction, Request, Response } from "express";
import { getUserInfo } from "../functions/jwt";
import { prisma } from "../prisma";
import { stripe } from "../stripe";

/**
 * Middleware to log requests to the console
 * @param req - Express Request Object
 * @param res - Express Response Object
 * @param next - Express Next Function
 * @returns void
 */
export const stripeMeter = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let userInfo = await getUserInfo(prisma, res, req);

  let cusId = userInfo.stripeCustomerId;

  const record = await stripe.billing.meterEvents.create({
    event_name: "phish.directory_api_requests",
    payload: {
      value: "1",
      stripe_customer_id: cusId,
    },
  });

  next();
};

import { NextFunction, Request, Response } from "express";

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
  next: NextFunction
): Promise<void> => {
  next();
  // if (process.env.NODE_ENV === "production") {
  //   // metrics.increment("stripeMeter.requests");
  //   let userInfo = await getUserInfo(prisma, res, req);

  //   if (!userInfo) {
  //     // 401 is Unauthorized
  //     res.status(401).json({
  //       error: "Unauthorized",
  //     });
  //   }

  //   let cusId = userInfo.stripeCustomerId;

  //   if (!cusId) {
  //     res.status(400).json({
  //       error: "No Stripe Customer ID",
  //     });
  //   }

  //   const record = await stripe.billing.meterEvents.create({
  //     event_name: "phish.directory_api_requests",
  //     payload: {
  //       value: "1",
  //       stripe_customer_id: cusId,
  //     },
  //   });

  //   next();
  // } else {
  //   next();
  // }
};

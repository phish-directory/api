import * as jwt from "jsonwebtoken";

// import metrics from "../metrics";
import { prisma } from "../prisma";

/**
 * Function to authenticate the token
 * @param req - Express Request Object
 * @param res - Express Response Object
 * @param next - Express Next Function
 * @returns void
 */
export async function authenticateToken(req: any, res: any, next: any) {
  // metrics.increment("functions.jwt.authenticateToken");

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  let jwUser = jwt.verify(
    token,
    process.env.JWT_SECRET! as string,
    (err: any, user: any) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      } else {
        return user;
      }
    }
  );

  let user = await prisma.user.findUnique({
    where: {
      // @ts-expect-error
      id: jwUser.id,
    },
  });

  if (!user) {
    return res.status(400).json("User not found");
  }

  if (user.deleted === true) {
    return res
      .status(403)
      .json(
        "Your user has been deleted. Please contact support if you believe this is an error or need to reactivate your account."
      );
  }

  req.user = user;
  next();
}

/**
 * Function to generate an access token
 * @param user - User object
 * @returns token
 */
export async function generateAccessToken(user: any) {
  const tsStart = Date.now();
  // metrics.increment("functions.jwt.generateAccessToken");

  let token = jwt.sign(
    {
      id: user.id,
      uuid: user.uuid,
    },
    process.env.JWT_SECRET!
  );
  const tsEnd = Date.now();
  // metrics.timing("functions.jwt.generateAccessToken", tsEnd - tsStart);
  return token;
}

/**
 * Function to get the user info
 * @param prisma - Prisma Client
 * @param res - Express Response Object
 * @param req - Express Request Object
 * @returns user
 */
export async function getUserInfo(prisma: any, res: any, req: any) {
  const tsStart = Date.now();
  // metrics.increment("functions.jwt.getUserInfo");

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  // decode the token
  let decoded = jwt.decode(token);
  // @ts-expect-error
  let id = decoded!.id;
  id = id as string;

  let user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  const tsEnd = Date.now();
  // metrics.timing("functions.jwt.getUserInfo", tsEnd - tsStart);

  return user;
}

export async function getPermissionLevel(prisma: any, res: any, req: any) {
  const tsStart = Date.now();
  // metrics.increment("functions.jwt.getPermissionLevel");

  const info = await getUserInfo(prisma, res, req);
  // console.log(info);

  const tsEnd = Date.now();
  // metrics.timing("functions.jwt.getPermissionLevel", tsEnd - tsStart);
}

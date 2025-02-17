import rateLimit from "express-rate-limit";
import jwt, { JwtPayload } from "jsonwebtoken";

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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  // add rate limiting
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  try {
    // Verify token synchronously without callback
    const jwUser = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    let user = await prisma.user.findUnique({
      where: {
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
  } catch (err) {
    console.log(err);
    return res.sendStatus(403);
  }
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

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  // Add interface for JWT payload
  interface JwtPayload {
    id: string;
    uuid: string;
    iat?: number;
  }

  // Properly type the decoded token
  let decoded = jwt.decode(token) as JwtPayload;
  if (!decoded) {
    return res.sendStatus(403);
  }

  let id = decoded.id;
  // No need for explicit cast since id is already typed as string

  let user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  const tsEnd = Date.now();
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

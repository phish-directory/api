import jwt, { JwtPayload } from "jsonwebtoken";

// import metrics from "../metrics";
import * as logger from "../utils/logger";
import { db } from "../utils/db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

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

  try {
    // Verify token synchronously without callback
    const jwUser = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    let user = await db.query.users.findFirst({
      where: (users) => eq(users.id, jwUser.id),
    });

    if (!user) {
      return res.status(400).json("User not found");
    }

    if (user.deleted_at !== null) {
      return res
        .status(403)
        .json(
          "Your user has been deleted. Please contact support if you believe this is an error or need to reactivate your account."
        );
    }

    req.user = user;
    
    next();
  
  } catch (err) {
    logger.error(`${err}`);
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
 * @param res - Express Response Object
 * @param req - Express Request Object
 * @returns user
 */
export async function getUserInfo(req: any) {
  const tsStart = Date.now();

  // FIXME:
  // for some reson, even when we have headers, we still get a error, so this is the temp solution
  if (!req.headers) {
    return logger.debug("No headers found, but not actually an error");
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return null;

  // Add interface for JWT payload
  interface JwtPayload {
    id: number;
    uuid: string;
    iat?: number;
  }

  // Properly type the decoded token
  let decoded = jwt.decode(token) as JwtPayload;
  if (!decoded) {
    return console.error("Error decoding token");
  }

  let id = decoded.id;
  // No need for explicit cast since id is already typed as string

  const user = await db.query.users.findFirst({
    where: (users) => eq(users.id, id),
  });

  if (!user) {
    return console.error("User not found");
  }

  const tsEnd = Date.now();
  return user;
}

export async function getPermissionLevel(req: any) {
  const tsStart = Date.now();
  // metrics.increment("functions.jwt.getPermissionLevel");

  const info = await getUserInfo(req);

  const tsEnd = Date.now();
  // metrics.timing("functions.jwt.getPermissionLevel", tsEnd - tsStart);

  return info!.permissionLevel;
}

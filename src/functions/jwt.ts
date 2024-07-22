import * as jwt from "jsonwebtoken";

export async function getTokenFromHeader(req: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  return token;
}

export async function authenticateToken(req: any, res: any, next: any) {
  const token = await getTokenFromHeader(req);
  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.JWT_SECRET! as string,
    (err: any, user: any) => {
      console.log(err);

      if (err) return res.sendStatus(403);

      req.user = user;

      next();
    }
  );
}

export async function generateAccessToken(user: any) {
  let token = jwt.sign(
    {
      id: user.id,
      uuid: user.uuid,
    },
    process.env.JWT_SECRET!
  );
  return token;
}

export async function getUserInfo(prisma: any, res: any, req: any) {
  const token = await getTokenFromHeader(req);
  console.log(token);

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

  return user;
}

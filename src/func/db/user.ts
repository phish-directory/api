import { eq } from "drizzle-orm";

import { db } from "../../utils/db";

export async function getDbUser(id: number) {
  const dbUser = await db.query.users.findFirst({
    where: (users) => eq(users.id, id),
  });

  return dbUser;
}
  
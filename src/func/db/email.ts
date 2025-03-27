import { eq } from "drizzle-orm";

import { db } from "../../utils/db";

export async function getDbEmail(email: string) {
  const dbEmail = await db.query.emails.findFirst({
    where: (emails) => eq(emails.email, email),
  });

  return dbEmail;
}
  
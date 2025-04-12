import { eq } from "drizzle-orm";

import { domains } from "src/db/schema";
import { db } from "src/utils/db";
import { sanitizeDomain } from "src/utils/sanitizeDomain";

export async function getDbDomain(domain: string) {
  let sanitizedDomain = sanitizeDomain(domain);

  const dbDomain = await db.query.domains.findFirst({
    where: (domains) => eq(domains.domain, sanitizedDomain),
  });

  return dbDomain;
}

export async function createDbDomain(domain: string) {
  let sanitizedDomain = sanitizeDomain(domain);

  const dbDomain = await db.insert(domains).values({
    domain: sanitizedDomain,
    last_checked: new Date(),
  });

  return dbDomain;
}

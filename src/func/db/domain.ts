import { eq } from "drizzle-orm";

import { sanitizeDomain } from "../../utils/sanitizeDomain";
import { db } from "../../utils/db";
import { domains } from "src/db/schema";

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
    last_checked: new Date()
  });

  return dbDomain;
}

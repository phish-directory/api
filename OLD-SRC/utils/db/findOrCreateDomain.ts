import { prisma } from "../../prisma";
import { checkAndUpdateDomainStatus } from "../domain/checkAndUpdateDomainStatus";
import { domainCheck } from "../domain/domain";

/**
 * Finds a domain in the database or creates a new entry if not found
 * @param {string} domain - Domain to find or create
 * @returns {Object} - Domain database record
 */
export async function findOrCreateDomain(domain) {
  let dbDomain = await prisma.domain.findFirst({
    where: { domain: domain },
  });

  if (!dbDomain) {
    dbDomain = await prisma.domain.create({
      data: { domain: domain },
    });

    await checkAndUpdateDomainStatus(domain, dbDomain.id);
  } else {
    // Trigger a check but don't wait for results
    domainCheck(domain).catch((err) =>
      console.error(`Error checking domain ${domain}:`, err)
    );
  }

  return dbDomain;
}

import { eq } from "drizzle-orm";
import { db } from "src/utils/db";
import { DomainCheckResponse } from "../../defs/interfaces";
import { reportToAlienVault } from "./reportToAlienVault";
import { rawAPIData } from "src/db/schema";

/**
 * Prepares the response object based on domain status and extended data flag
 * @param {string} domain - Domain that was checked
 * @param {Object} dbDomain - Domain database record
 * @param {boolean} extendData - Whether to include extended data
 * @returns {Promise<DomainCheckResponse>} - Response object
 */
export async function prepareResponse(
  domain,
  dbDomain,
  extendData
): Promise<DomainCheckResponse> {
  // If domain is malicious, report it to AlienVault
  if (dbDomain.malicious) {
    await reportToAlienVault(domain).catch((err) =>
      console.error(`Error reporting ${domain} to AlienVault:`, err)
    );
  }

  // Prepare base response
  const response: DomainCheckResponse = {
    domain: domain,
    phishing: Boolean(dbDomain.malicious),
    times: {
      created_at: dbDomain.created_at,
      updated_at: dbDomain.updated_at,
      last_checked: dbDomain.last_checked,
    },
  };

  // Add raw API data if extended data is requested
  if (extendData) {
    const apiDataResults = await db.select().from(rawAPIData).where(eq(rawAPIData.domain, dbDomain.id));

    response.rawData = apiDataResults;
  }   

  return response;
}

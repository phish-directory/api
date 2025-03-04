import { DomainCheckResponse } from "../../defs/interfaces";
import { prisma } from "../../utils/prisma";
import { reportToAlienVault } from "./reportToAlienVault";

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
      createdAt: dbDomain.createdAt,
      updatedAt: dbDomain.updatedAt,
      lastChecked: dbDomain.lastChecked,
    },
  };

  // Add raw API data if extended data is requested
  if (extendData) {
    const rawAPIData = await prisma.rawAPIData.findMany({
      where: { domainId: dbDomain.id },
    });

    response.rawData = rawAPIData;
  }

  return response;
}

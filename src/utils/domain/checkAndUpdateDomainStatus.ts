import { prisma } from "../../prisma";
import { domainCheck } from "./domain";
import { parseData } from "./parseData";
import { reportToAlienVault } from "./reportToAlienVault";

/**
 * Checks domain against various services and updates its status in the database
 * @param {string} domain - Domain to check
 * @param {string} domainId - Database ID of the domain
 */
export async function checkAndUpdateDomainStatus(domain, domainId) {
  const data = await domainCheck(domain);

  const isPhish = await parseData(
    data.walshyData,
    data.ipQualityScoreData,
    data.googleSafebrowsingData,
    data.sinkingYahtsData,
    data.virusTotalData,
    data.phishObserverData,
    data.urlScanData,
    data.securitytrailsData,
    data.phishreportData
  );

  await prisma.domain.update({
    where: { id: domainId },
    data: {
      malicious: Boolean(isPhish), // Ensure it's a boolean primitive
      lastChecked: new Date(),
    },
  });

  if (isPhish) {
    await reportToAlienVault(domain);
  }
}

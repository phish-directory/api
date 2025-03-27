import { db } from "src/utils/db";
import { domainCheck } from "./domain";
import { parseData } from "./parseData";
import { reportToAlienVault } from "./reportToAlienVault";
import { domains } from "src/db/schema";
import { eq } from "drizzle-orm";


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
    data.phishreportData,
    data.abuseChData
  );

  await db.update(domains)
  .set({
    malicious: Boolean(isPhish),
    last_checked: new Date(),
  })
  .where(eq(domains.id, domainId));

  if (isPhish) {
    await reportToAlienVault(domain);
  }
}

// import metrics from "../metrics";
import {
  abuseChService,
  googleSafebrowsingService,
  ipQualityScoreService,
  phishObserverService,
  phishReportService,
  securityTrailsService,
  sinkingYahtsService,
  urlScanService,
  virusTotalService,
  walshyService,
} from "src/services/_index";

import { domains } from "src/db/schema";
import { getDbDomain } from "src/func/db/domain";
import { db } from "src/utils/db";

/**
 * Check the domain against all the services
 * @param domain - Domain to check
 * @returns void
 */
export async function domainCheck(domain: string) {
  const tsStart = Date.now();
  // metrics.increment("functions.domainCheck");

  let walshyData = await walshyService.domain.check(domain);
  let ipQualityScoreData = await ipQualityScoreService.domain.check(domain);
  let googleSafebrowsingData =
    await googleSafebrowsingService.domain.check(domain);
  let sinkingYahtsData = await sinkingYahtsService.domain.check(domain);
  let virusTotalData = await virusTotalService.domain.check(domain);
  let phishObserverData = await phishObserverService.domain.check(domain);
  let urlScanData = await urlScanService.domain.check(domain);
  let securitytrailsData = await securityTrailsService.domain.check(domain);
  let phishreportData = await phishReportService.domain.check(domain);
  let abuseChData = await abuseChService.domain.check(domain);

  let dbDomain = await getDbDomain(domain);

  if (!dbDomain) {
    dbDomain = await db.insert(domains).values({
      domain: domain,
    });
  }

  // metrics.timing("functions.timing.domainCheck", Date.now() - tsStart);

  return {
    walshyData,
    ipQualityScoreData,
    googleSafebrowsingData,
    sinkingYahtsData,
    virusTotalData,
    phishObserverData,
    urlScanData,
    securitytrailsData,
    phishreportData,
    abuseChData,
  };
}

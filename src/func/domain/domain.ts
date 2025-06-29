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
import { warn } from "src/utils/logger";

/**
 * Helper function to safely call an external API service with quota error handling
 * @param serviceName - Name of the service for logging
 * @param serviceCall - Promise function to call the service
 * @param domain - Domain being checked (for logging)
 * @returns Service response or null if failed
 */
async function safeServiceCall(
  serviceName: string,
  serviceCall: () => Promise<any>,
  domain: string
): Promise<any> {
  try {
    return await serviceCall();
  } catch (error: any) {
    // Check for quota/rate limit errors
    if (
      error?.response?.status === 429 ||
      error?.response?.status === 402 ||
      error?.code === "RATE_LIMITED" ||
      error?.message?.toLowerCase().includes("quota") ||
      error?.message?.toLowerCase().includes("rate limit") ||
      error?.message?.toLowerCase().includes("too many requests")
    ) {
      warn(
        `${serviceName}: API quota/rate limit exceeded for domain "${domain}". Skipping this service check.`
      );
    } else {
      // Log other types of errors with less severity
      warn(
        `${serviceName}: API error for domain "${domain}": ${
          error instanceof Error ? error.message : error
        }. Skipping this service check.`
      );
    }
    return null;
  }
}

/**
 * Check the domain against all the services
 * @param domain - Domain to check
 * @returns void
 */
export async function domainCheck(domain: string) {
  const tsStart = Date.now();
  // metrics.increment("functions.domainCheck");

  // Use graceful error handling for each service call
  let walshyData = await safeServiceCall(
    "Walshy",
    () => walshyService.domain.check(domain),
    domain
  );
  let ipQualityScoreData = await safeServiceCall(
    "IpQualityScore",
    () => ipQualityScoreService.domain.check(domain),
    domain
  );
  let googleSafebrowsingData = await safeServiceCall(
    "GoogleSafebrowsing",
    () => googleSafebrowsingService.domain.check(domain),
    domain
  );
  let sinkingYahtsData = await safeServiceCall(
    "SinkingYahts",  
    () => sinkingYahtsService.domain.check(domain),
    domain
  );
  let virusTotalData = await safeServiceCall(
    "VirusTotal",
    () => virusTotalService.domain.check(domain),
    domain
  );
  let phishObserverData = await safeServiceCall(
    "PhishObserver",
    () => phishObserverService.domain.check(domain),
    domain
  );
  let urlScanData = await safeServiceCall(
    "UrlScan",
    () => urlScanService.domain.check(domain),
    domain
  );
  let securitytrailsData = await safeServiceCall(
    "SecurityTrails",
    () => securityTrailsService.domain.check(domain),
    domain
  );
  let phishreportData = await safeServiceCall(
    "PhishReport",
    () => phishReportService.domain.check(domain),
    domain
  );
  let abuseChData = await safeServiceCall(
    "AbuseCh",
    () => abuseChService.domain.check(domain),
    domain
  );

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

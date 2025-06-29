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
 * Executes an external service call for a domain, returning the result or `null` if an error occurs.
 *
 * Handles quota and rate limit errors gracefully by logging a warning and skipping the service check, allowing the overall process to continue without interruption.
 *
 * @param serviceName - The name of the external service being called, used for logging context.
 * @param serviceCall - A function that returns a Promise for the external service request.
 * @param domain - The domain being checked, included in log messages for context.
 * @returns The service response if successful, or `null` if an error or quota limit is encountered.
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
 * Performs security and reputation checks on a domain using multiple external services.
 *
 * Calls a set of external services to assess the given domain, handling errors gracefully for each service. Ensures the domain is recorded in the database if not already present.
 *
 * @param domain - The domain name to check
 * @returns An object containing the results from each service, with `null` for any service that failed or was rate-limited
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

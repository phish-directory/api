/**
 * parses the data from the different sources and returns a boolean value
 * @param walshyData - Data from Walshy API
 * @param ipQualityScoreData - Data from IPQualityScore API
 * @param googleSafebrowsingData - Data from Google Safebrowsing API
 * @param sinkingYahtsData - Data from Sinking Yahts API
 * @param virusTotalData - Data from VirusTotal API
 * @param phishObserverData - Data from PhishObserver API
 * @param urlScanData - Data from URLScan API
 * @param securitytrailsData - Data from SecurityTrails API
 * @param phishreportData - Data from Phishreport API
 * @param abuseChData - Data from AbuseCh API
 * @returns boolean
 **/
export async function parseData(
  walshyData: any,
  ipQualityScoreData: any,
  googleSafebrowsingData: any,
  sinkingYahtsData: any,
  virusTotalData: any,
  phishObserverData: any,
  urlScanData: any,
  securitytrailsData: any,
  phishreportData: any,
  abuseChData: any
): Promise<Boolean> {
  // return true;

  const tsStart = Date.now();
  // metrics.increment("functions.domain.parseData");

  let verdict: boolean = false;

  // Check Walshy data - handle null/undefined gracefully
  if (walshyData && walshyData.badDomain) {
    verdict = true;
  }
  // Check Google Safe Browsing data - handle null/undefined gracefully
  else if (googleSafebrowsingData && Object.keys(googleSafebrowsingData).length !== 0) {
    verdict = true;
  }
  // Check IpQualityScore data - handle null/undefined gracefully
  else if (
    ipQualityScoreData &&
    (ipQualityScoreData.unsafe ||
      ipQualityScoreData.spam ||
      ipQualityScoreData.phishing ||
      ipQualityScoreData.malware)
  ) {
    verdict = true;
  }
  // Check SinkingYahts data - handle null/undefined gracefully
  else if (sinkingYahtsData) {
    verdict = true;
  }
  // Check UrlScan data - handle null/undefined gracefully
  else if (
    urlScanData &&
    urlScanData.verdicts &&
    urlScanData.verdicts.overall &&
    urlScanData.verdicts.overall.malicious === true
  ) {
    verdict = true;
  }
  // Check VirusTotal data - already has good null checking
  else if (
    virusTotalData &&
    virusTotalData.data &&
    virusTotalData.data.attributes &&
    virusTotalData.data.attributes.last_analysis_stats &&
    (virusTotalData.data.attributes.last_analysis_stats.malicious > 0 ||
      virusTotalData.data.attributes.last_analysis_stats.suspicious > 0)
  ) {
    verdict = true;
  }
  // TODO: add correct condition for abuseChData when needed
  // else if (abuseChData && abuseChData.query_status === "ok" && ...) {
  //   verdict = true;
  // }

  return verdict;
}

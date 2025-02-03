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
  phishreportData: any
): Promise<Boolean> {
  // return true;

  const tsStart = Date.now();
  // metrics.increment("functions.domain.parseData");

  let verdict: boolean;

  if (walshyData.badDomain) {
    verdict = true;
  } else if (Object.keys(googleSafebrowsingData).length !== 0) {
    verdict = true;
  } else if (
    ipQualityScoreData.unsafe ||
    ipQualityScoreData.spam ||
    ipQualityScoreData.phishing ||
    ipQualityScoreData.malware
  ) {
    verdict = true;
  } else if (sinkingYahtsData) {
    verdict = true;
  } else if (urlScanData.verdicts.overall.malicious === true) {
    verdict = true;
  } else if (
    virusTotalData.data.attributes.last_analysis_stats.malicious > 0 ||
    virusTotalData.data.attributes.last_analysis_stats.suspicious > 0
  ) {
    verdict = true;
  } else {
    verdict = false;
  }

  return verdict;

  // todo: add correct phishobserver check
}

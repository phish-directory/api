/**
 * parses the data from the different sources and returns a boolean value
 * @param walshyData - Data from Walshy API
 * @param ipQualityScoreData - Data from IPQualityScore API
 * @param googleSafebrowsingData - Data from Google Safebrowsing API
 * @param sinkingYahtsData - Data from Sinking Yahts API
 * @param virusTotalData - Data from VirusTotal API
 * @param phishermanData - Data from Phisherman API
 * @param phishObserverData - Data from PhishObserver API
 * @param urlScanData - Data from URLScan API
 * @returns boolean
 **/
export async function parseData(
  walshyData: any,
  ipQualityScoreData: any,
  googleSafebrowsingData: any,
  sinkingYahtsData: any,
  virusTotalData: any,
  phishermanData: any,
  phishObserverData: any,
  urlScanData: any,
): Promise<Boolean> {
  // return true;

  if (walshyData.badDomain) {
    return true;
  }

  if (Object.keys(googleSafebrowsingData).length !== 0) {
    return true;
  }

  if (
    ipQualityScoreData.unsafe ||
    ipQualityScoreData.spam ||
    ipQualityScoreData.phishing ||
    ipQualityScoreData.malware
  ) {
    return true;
  }

  if (phishermanData.verifiedPhish) {
    return true;
  }

  if (sinkingYahtsData) {
    return true;
  }

  if (urlScanData.verdicts.overall.malicious === true) {
    return true;
  }

  if (
    virusTotalData.data.attributes.last_analysis_stats.malicious > 0 ||
    virusTotalData.data.attributes.last_analysis_stats.suspicious > 0
  ) {
    return true;
  }

  // todo: add correct phishobserver check

  return false;
}

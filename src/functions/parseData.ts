export async function parseData(
  walshyData: any,
  ipQualityScoreData: any,
  googleSafebrowsingData: any,
  sinkingYahtsData: any,
  virusTotalData: any,
  phishermanData: any,
  phishObserverData: any,
): Promise<Boolean> {
  // return true;

  if (walshyData.badDomain) {
    return true;
  }

  if (Object.keys(googleSafebrowsingData).length !== 0) {
    return true;
  }

  if (
    ipQualityScoreData.data.unsafe ||
    ipQualityScoreData.data.spam ||
    ipQualityScoreData.data.phishing ||
    ipQualityScoreData.data.malware
  ) {
    return true;
  }

  if (phishermanData.data.verifiedPhish) {
    return true;
  }

  if (sinkingYahtsData) {
    return true;
  }

  //     urlScanResponse.data.verdicts.malicious

  if (
    virusTotalData.data.attributes.last_analysis_stats.malicious > 0 ||
    virusTotalData.data.attributes.last_analysis_stats.suspicious > 0
  ) {
    return true;
  }

  // todo: add correct phishobserver check

  return false;
}

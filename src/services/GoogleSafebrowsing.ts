import axios from "axios";

/**
 * A service that provides access to the Google Safebrowsing for checking and reporting domains.
 */
export class GoogleSafebrowsingService {
  /**
   * Asynchronously checks a given domain against the google safebrowsing service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns
   */
  async check(domain: string) {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY!}`,
      {
        client: {
          clientId: `phish.directory`,
          clientVersion: `${process.env.npm_package_version!}`,
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [
            {
              url: domain,
            },
          ],
        },
      },
    );

    return response.data;
  }

  /**
   * Asynchronously reports a given domain to the google safebrowsing service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @returns
   */
  async report(domain: string) {
    // todo: implement this
  }
}

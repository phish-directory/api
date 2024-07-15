import axios from "axios";

/**
 * A service that provides access to the IpQualityScore service for checking and reporting domains.
 */
export class IpQualityScoreService {
  /**
   * Asynchronously checks a given domain against the IpQualityScore service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns
   */
  async check(domain: string) {
    const response = await axios.get(
      `https://ipqualityscore.com/api/json/url/${process.env.IPQS_API_KEY!}/${domain}`,
      {
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );
  }

  /**
   * Asynchronously reports a given domain to the IpQualityScore service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @returns
   */
  async report(domain: string) {
    // todo: implement this
  }
}

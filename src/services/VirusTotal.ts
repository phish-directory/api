import axios from "axios";

/**
 * A service that provides access to the VirusTotal service for checking and reporting domains.
 */
export class VirusTotalService {
  /**
   * Asynchronously checks a given domain against the VirusTotal service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns
   */
  async check(domain: string) {
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      {
        headers: {
          "x-apikey": process.env.VIRUS_TOTAL_API_KEY,
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    return response.data;
  }

  /**
   * Asynchronously reports a given domain to the VirusTotal service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @returns
   */
  async report(domain: string) {
    // todo: implement this
  }
}

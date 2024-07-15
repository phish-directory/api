import axios from "axios";

/**
 * A service that provides access to the walshy service for checking and reporting domains.
 */
export class WalshyService {
  /**
   * Asynchronously checks a given domain against the walshy service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns {Promise<{ badDomain: boolean, detection: "discord" | "community" }>} A promise that resolves with the check results.
   */
  async check(
    domain: string,
  ): Promise<{ badDomain: boolean; detection: "discord" | "community" }> {
    const responnse = await axios.post<{
      badDomain: boolean;
      detection: "discord" | "community";
    }>("https://bad-domains.walshy.dev/check", {
      // todo: extract headers to a seperate place to avoid duplication
      headers: {
        Referer: "https://phish.directory",
        "User-Agent": "internal-server@phish.directory",
        "X-Identity": "internal-server@phish.directory",
      },
      domain: domain,
    });

    return responnse.data;
  }

  /**
   * Asynchronously reports a given domain to the walshy service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @returns {Promise<void>} A promise that resolves when the report operation is complete.
   */
  async report(domain: string): Promise<void> {
    // todo: implement this
  }
}

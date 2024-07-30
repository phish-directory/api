import axios from "axios";
import metrics from "../metrics";

/**
 * A service that provides access to the SinkingYahts service for checking and reporting domains.
 */
export class SinkingYahtsService {
  /**
   * Asynchronously checks a given domain against the SinkingYahts service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: any) {
    metrics.increment("domain.check.api.sinkingyahts");

    const response = await axios.get<boolean>(
      `https://phish.sinking.yachts/v2/check/${domain}`,
      {
        headers: {
          accept: "application/json",
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    return response.data;
  }
}

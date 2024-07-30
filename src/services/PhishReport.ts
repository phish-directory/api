import axios from "axios";
import metrics from "../metrics";

/**
 * A service that provides access to the PhishReport service for checking and reporting domains.
 */
export class PhishReportService {
  /**
   * Asynchronously checks a given domain against the PhishReport service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: any) {
    metrics.increment("domain.check.api.phishreport");

    let rsp = await axios.get(
      `https://phish.report/api/v0/hosting?url=${domain}`,
      {
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    return rsp.data;
  }

  /**
   * Asynchronously reports a given domain to the PhishReport service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async report(domain: string, prisma: any) {
    metrics.increment("domain.report.api.phishreport");

    // todo: implement this
    // https://phish.report/api/v0#tag/Takedown/paths/~1api~1v0~1cases/post
  }
}

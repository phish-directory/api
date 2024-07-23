import axios from "axios";

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
    let rsp = await axios.get(
      `hhttps://phish.report/api/v0/hosting?domain=${domain}`
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
    // todo: implement this
  }
}

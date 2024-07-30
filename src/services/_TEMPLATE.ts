import axios from "axios";
import metrics from "../metrics";

/**
 * A service that provides access to the TEMPLATE service for checking and reporting domains.
 */
export class TEMPLATEService {
  /**
   * Asynchronously checks a given domain against the TEMPLATE service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: any) {
    metrics.increment("domain.check.api.template");
  }

  /**
   * Asynchronously reports a given domain to the TEMPLATE service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async report(domain: string, prisma: any) {
    metrics.increment("domain.report.api.template");
    // todo: implement this
  }
}

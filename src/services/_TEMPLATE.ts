// import axios from "axios";
import { PrismaClient } from "@prisma/client";

/**
 * A service that provides access to the TEMPLATE service for checking and reporting domains.
 */
export class TEMPLATEService {
  /**
   * Asynchronously checks a given domain against the TEMPLATE service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {PrismaClient} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: PrismaClient) {}

  /**
   * Asynchronously reports a given domain to the TEMPLATE service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @returns
   */
  async report(domain: string) {
    // todo: implement this
  }
}

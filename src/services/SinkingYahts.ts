import { PrismaClient } from "@prisma/client";
import axios from "axios";

/**
 * A service that provides access to the SinkingYahts service for checking and reporting domains.
 */
export class SinkingYahtsService {
  /**
   * Asynchronously checks a given domain against the SinkingYahts service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {PrismaClient} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: PrismaClient) {
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

  /**
   * Asynchronously reports a given domain to the SinkingYahts service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @param {PrismaClient} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async report(domain: string, prisma: PrismaClient) {
    // todo: implement this
  }
}

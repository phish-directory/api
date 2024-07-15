import { PrismaClient } from "@prisma/client";
import axios from "axios";

/**
 * A service that provides access to the IpQualityScore service for checking and reporting domains.
 */
export class IpQualityScoreService {
  /**
   * Asynchronously checks a given domain against the IpQualityScore service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {PrismaClient} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: PrismaClient) {
    const response = await axios.get(
      `https://ipqualityscore.com/api/json/url/${process.env.IPQS_API_KEY!}/${domain}`,
      {
        // todo: extract headers to a seperate place to avoid duplication
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    return response.data;
  }

  /**
   * Asynchronously reports a given domain to the IpQualityScore service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @param {PrismaClient} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async report(domain: string, prisma: PrismaClient) {
    // todo: implement this
  }
}

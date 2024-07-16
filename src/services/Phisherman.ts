import { PrismaClient } from "@prisma/client";
import axios from "axios";

/**
 * A service that provides access to the Phisherman service for checking and reporting domains.
 */
export class PhishermanService {
  /**
   * Asynchronously checks a given domain against the Phisherman service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {PrismaClient} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: PrismaClient) {
    const response = await axios.get(
      `https://api.phisherman.gg/v2/domains/info/${domain}`,
      {
        // todo: extract headers to a seperate place to avoid duplication (will need to handle adding the Authorization header)
        headers: {
          Authorization: "Bearer " + process.env.PHISHERMAN_API_KEY!,
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    return response.data;
  }
}

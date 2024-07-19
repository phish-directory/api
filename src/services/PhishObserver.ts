import { PrismaClient } from "@prisma/client";
import axios from "axios";

/**
 * A service that provides access to the PhishObserver service for checking and reporting domains.
 */
export class PhishObserverService {
  /**
   * Asynchronously checks a given domain against the PhishObserver service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {PrismaClient} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: PrismaClient) {
    try {
      let submissionResponse = await axios.post(
        `https://phish.observer/api/submit`,
        {
          url: `https://${domain}`, // required
          tags: [
            // optional
            "phish.directory",
          ],
        },
        {
          headers: {
            Authorization: "Bearer " + process.env.PHISH_OBSERVER_API_KEY!,
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
          },
        },
      );

      let subdata = await submissionResponse.data;

      let searchResponse: any = await axios.get(
        `https://phish.observer/api/submission/${subdata.id}`,
        {
          headers: {
            Authorization: "Bearer " + process.env.PHISH_OBSERVER_API_KEY!,
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
          },
        },
      );

      return searchResponse.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.error === "Blocked domain"
      ) {
        return {
          error: "Blocked domain",
        };
      } else {
        throw error;
      }
    }
  }
}

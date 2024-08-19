import axios from "axios";

import metrics from "../metrics";
import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";

/**
 * A service that provides access to the PhishObserver service for checking and reporting domains.
 */
export class PhishObserverService {
  domain = {
    /**
     * Asynchronously checks a given domain against the PhishObserver service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      metrics.increment("services.phishobserver.domain.check");

      try {
        let submissionResponse = await axios.post(
          `https://phish.observer/api/submit`,
          {
            url: `https://${domain}`,
            tags: ["phish.directory"],
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

        const dbDomain = await getDbDomain(domain);

        await prisma.rawAPIData.create({
          data: {
            sourceAPI: "PhishObserver",
            domain: {
              connect: {
                id: dbDomain.id,
              },
            },
            data: searchResponse.data,
          },
        });

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
    },
  };
}

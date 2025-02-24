import axios from "axios";

import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";
import { sanitizeDomain } from "../utils/sanitizeDomain";

/**
 * A service that provides access to the Walshy service for checking and reporting domains.
 */
export class WalshyService {
  domain = {
    /**
     * Asynchronously checks a given domain against the Walshy service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.walshy.domain.check");
      const sanitizedDomain = await sanitizeDomain(domain);

      const response = await axios.post<{
        badDomain: boolean;
        detection: "discord" | "community";
      }>("https://bad-domains.walshy.dev/check", {
        // todo: extract headers to a seperate place to avoid duplication
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
        domain: `${sanitizedDomain}`,
      });

      const data = response.data;
      const dbDomain = await getDbDomain(sanitizedDomain);

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "Walshy",
          domain: {
            connect: {
              id: dbDomain.id,
            },
          },
          data: data,
        },
      });

      return data;
    },

    // todo: log report counts and data to the database
    /**
     * Asynchronously reports a given domain to the Walshy service for further processing or analysis.
     *
     * @param {string} domain - The domain name to be reported.
     * @returns
     */
    report: async (domain: string) => {
      // metrics.increment("services.walshy.domain.report");

      const sanitizedDomain = await sanitizeDomain(domain);

      const response = await axios.post(
        `https://bad-domains.walshy.dev/report`,
        {
          domain: sanitizedDomain,
        },
        {
          headers: {
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
          },
        }
      );

      return response.data;
    },
  };
}

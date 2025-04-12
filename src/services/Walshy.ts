import { rawAPIData } from "src/db/schema";
import { headers } from "src/defs/headers";
import { getDbDomain } from "src/func/db/domain";
import { axios } from "src/utils/axios";
import { db } from "src/utils/db";
import { sanitizeDomain } from "src/utils/sanitizeDomain";

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
        headers,
        domain: `${sanitizedDomain}`,
      });

      const data = response.data;
      const dbDomain = await getDbDomain(sanitizedDomain);

      await db.insert(rawAPIData).values({
        sourceAPI: "Walshy",
        domain: dbDomain!.id!,
        data: data,
      });

      return data;
    },

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
          headers,
        }
      );

      return response.data;
    },
  };
}

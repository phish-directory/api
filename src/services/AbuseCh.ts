import { rawAPIData } from "src/db/schema";
import { headers } from "../defs/headers";
import { getDbDomain } from "../func/db/domain";
import { axios } from "../utils/axios";
import { sanitizeDomain } from "../utils/sanitizeDomain";
import { db } from "src/utils/db";

/**
 * A service that provides access to the AbuseCh service for checking and reporting domains, emails, etc.
 */
export class AbuseChService {
  domain = {
    /**
     * Asynchronously checks a given domain against the AbuseCh service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.abusech.domain.check");

      let response = await axios.get(
        `https://urlhaus.abuse.ch/api/v1/host/${domain}`,
        {
          headers,
        }
      );

      let sanitizedDomain = await sanitizeDomain(domain);
      const dbDomain = await getDbDomain(sanitizedDomain);

      // Check if the response is JSON before saving to database
      if (response.headers["content-type"]?.includes("application/json")) {
        let data = response.data;

        await db.insert(rawAPIData).values({
          sourceAPI: "AbuseCh",
          domain: dbDomain!.id!,
          data: data,
        });

        return data;
      } else {
        return response.data;
      }
    },

    // /**
    //  * Asynchronously reports a given domain to the AbuseCh service for further processing or analysis.
    //  *
    //  * @param {string} domain - The domain name to be reported.
    //  * @returns
    //  */
    // report: async (domain: string) => {
    //   // metrics.increment("services.abusech.domain.report");
    //   // Implement the report logic here
    // },
  };
}

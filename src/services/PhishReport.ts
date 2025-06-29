import { rawAPIData } from "src/db/schema";
import { headers } from "src/defs/headers";
import { getDbDomain } from "src/func/db/domain";
import { axios } from "src/utils/axios";
import { db } from "src/utils/db";
import { sanitizeDomain } from "src/utils/sanitizeDomain";

/**
 * A service that provides access to the PhishReport service for checking and reporting domains.
 */
export class PhishReportService {
  domain = {
    /**
     * Asynchronously checks a given domain against the PhishReport service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.phishreport.domain.check");

      const sanitizedDomain = sanitizeDomain(domain);

      let response = await axios.get(
        `https://phish.report/api/v0/hosting?url=${sanitizedDomain}`,
        {
          headers: headers,
        }
      );

      let data = response.data;
      let dbDomain = await getDbDomain(sanitizedDomain);

      await db.insert(rawAPIData).values({
        sourceAPI: "PhishReport",
        domain: dbDomain!.id!,
        data: data,
      });

      return data;
    },

    // /**
    //  * Asynchronously reports a given domain to the PhishReport service for further processing or analysis.
    //  *
    //  * @param {string} domain - The domain name to be reported.
    //  * @returns
    //  */
    // report: async (domain: string) => {

    // const sanitizedDomain = await sanitizeDomain(domain);

    // metrics.increment("services.phishreport.domain.report");

    // https://phish.report/api/v0#tag/Takedown/paths/~1api~1v0~1cases/post
    // },
  };
}

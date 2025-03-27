import { APIs, rawAPIData } from "src/db/schema";
import { db } from "src/utils/db";
import { headersWithSinkingYahts } from "../defs/headers";
import { getDbDomain } from "../func/db/domain";
import { axios } from "../utils/axios";
//FIXME: Add back db logic
import { sanitizeDomain } from "../utils/sanitizeDomain";

/**
 * A service that provides access to the SinkingYahts service for checking and reporting domains.
 */
export class SinkingYahtsService {
  domain = {
    /**
     * Asynchronously checks a given domain against the SinkingYahts service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.sinkingyahts.domain.check");
      const sanitizedDomain = await sanitizeDomain(domain);

      const response = await axios.get<boolean>(
        `https://phish.sinking.yachts/v2/check/${sanitizedDomain}`,
        {
          headers: headersWithSinkingYahts,
        }
      );

      const data = response.data;
      const dbDomain = await getDbDomain(sanitizedDomain);

      await db.insert(rawAPIData).values({
        sourceAPI: "SinkingYachts",
        domain: dbDomain!.id!,
        data: data,
      });

      return data;
    },
  };
}

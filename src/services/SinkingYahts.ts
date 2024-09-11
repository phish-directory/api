import axios from "axios";

import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";

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

      const response = await axios.get<boolean>(
        `https://phish.sinking.yachts/v2/check/${domain}`,
        {
          headers: {
            accept: "application/json",
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
          },
        }
      );

      const data = response.data;
      const dbDomain = await getDbDomain(domain);

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "SinkingYachts",
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
  };
}

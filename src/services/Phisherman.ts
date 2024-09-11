import axios from "axios";

import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";

/**
 * A service that provides access to the Phisherman service for checking and reporting domains.
 */
export class PhishermanService {
  domain = {
    /**
     * Asynchronously checks a given domain against the Phisherman service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.phisherman.domain.check");

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
        }
      );

      const data = response.data;
      const dbDomain = await getDbDomain(domain);

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "Phisherman",
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

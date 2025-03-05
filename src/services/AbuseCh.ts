import { headers } from "../defs/headers";
import { axios } from "../utils/axios";
import { prisma } from "../utils/prisma";

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

      let data = response.data;

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "AbuseCh",
          domain: {
            connect: {
              id: data.id,
            },
          },
          data: data,
        },
      });

      return data;
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

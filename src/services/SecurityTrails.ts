import axios from "axios";

import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";

/**
 * A service that provides access to the SecurityTrails service for checking and reporting domains.
 */
export class SecurityTrailsService {
  domain = {
    /**
     * Asynchronously checks a given domain against the SecurityTrails service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.securitytrails.domain.check");

      const options = {
        method: "GET",
        url: `https://api.securitytrails.com/v1/domain/${domain}`,
        headers: {
          accept: "application/json",
          APIKEY: process.env.SECURITYTRAILS_API_KEY!,
        },
      };

      const response = await axios.request(options);
      const data = response.data;
      const dbDomain = await getDbDomain(domain);

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "SecurityTrails",
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

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
     * @returns {Promise<any>} - The API response or a fallback if a rate limit error occurs.
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

      try {
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
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn(
            `Rate limit exceeded for domain: ${domain}. Returning empty result.`
          );
          // Handle 429 error (Too Many Requests) by returning a fallback response.
          return {
            error: "Rate limit exceeded",
            retryAfter: error.response.headers["retry-after"] || "unknown",
          };
        }

        // Re-throw other errors to avoid silently ignoring critical issues.
        throw error;
      }
    },
  };
}

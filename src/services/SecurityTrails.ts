import { rawAPIData } from "src/db/schema";
import { db } from "src/utils/db";
import { headersWithSecurityTrails } from "../defs/headers";
import { getDbDomain } from "../func/db/domain";
import { axios } from "../utils/axios";
//FIXME: Add back db logic
import { sanitizeDomain } from "../utils/sanitizeDomain";

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

      const sanitizedDomain = await sanitizeDomain(domain);

      const options = {
        method: "GET",
        url: `https://api.securitytrails.com/v1/domain/${sanitizedDomain}`,
        headers: headersWithSecurityTrails,
      };

      const optionsTwo = {
        method: "GET",
        url: `https://api.securitytrails.com/v1/domain/${sanitizedDomain}/subdomains`,
        headers: headersWithSecurityTrails,
      };

      try {
        const response = await axios.request(options);
        const data = response.data;
        const dbDomain = await getDbDomain(sanitizedDomain);

        await db.insert(rawAPIData).values({
          sourceAPI: "SecurityTrails",
          domain: dbDomain!.id!,
          data: data,
        });

        const response2 = await axios.request(optionsTwo);
        const data2 = response2.data;
       
        await db.insert(rawAPIData).values({
          sourceAPI: "SecurityTrails",
          domain: dbDomain!.id!,
          data: data2,
        });

        return data;
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn(
            `Rate limit exceeded for domain: ${sanitizedDomain}. Returning empty result.`
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

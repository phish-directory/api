import { rawAPIData } from "src/db/schema";
import { headersWithVirusTotal } from "src/defs/headers";
import { getDbDomain } from "src/func/db/domain";
import { axios } from "src/utils/axios";
import { db } from "src/utils/db";
import { sanitizeDomain, validateDomain, DomainValidationError } from "src/utils/sanitizeDomain";

/**
 * A service that provides access to the VirusTotal service for checking and reporting domains.
 */
export class VirusTotalService {
  domain = {
    /**
     * Asynchronously checks a given domain against the VirusTotal service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      try {
        // metrics.increment("services.virustotal.domain.check");
        const sanitizedDomain = sanitizeDomain(domain);
        
        // Validate domain before making API call
        try {
          await validateDomain(sanitizedDomain);
        } catch (error) {
          if (error instanceof DomainValidationError) {
            console.warn(`VirusTotal: Skipping invalid domain "${domain}": ${error.message}`);
            return null;
          }
          throw error;
        }

        const response = await axios.get(
          `https://www.virustotal.com/api/v3/domains/${sanitizedDomain}`,
          {
            headers: headersWithVirusTotal,
          }
        );

        const data = response.data;
        const dbDomain = await getDbDomain(sanitizedDomain);

        await db.insert(rawAPIData).values({
          sourceAPI: "VirusTotal",
          domain: dbDomain!.id!,
          data: data,
        });

        return data;
      } catch (error) {
        // Log the error for transparency, but don't throw to prevent crashes
        console.warn(`VirusTotal API error for domain "${domain}":`, error instanceof Error ? error.message : error);
        return null;
      }
    },

    /**
     * Asynchronously reports a given domain to the VirusTotal service for further processing or analysis.
     *
     * @param {string} domain - The domain name to be reported.
     * @returns
     */
    report: async (domain: string) => {
      // metrics.increment("services.virustotal.domain.report");
      const sanitizedDomain = sanitizeDomain(domain);
      
      // Validate domain before making API call
      try {
        await validateDomain(sanitizedDomain);
      } catch (error) {
        if (error instanceof DomainValidationError) {
          console.warn(`VirusTotal: Skipping report for invalid domain "${domain}": ${error.message}`);
          return;
        }
        throw error;
      }

      const commentData = {
        data: {
          type: "comment",
          attributes: {
            text: "This website is present on the phish.directory anti phishing list. More info at https://phish.directory or via email at team@phish.directory",
          },
        },
      };

      axios
        .post(
          `https://www.virustotal.com/api/v3/domains/${sanitizedDomain}/comments`,
          commentData,
          {
            headers: headersWithVirusTotal,
          }
        )
        .catch((error) => {
          console.error(error);
        });

      const voteData = {
        data: {
          type: "vote",
          attributes: {
            verdict: "malicious",
          },
        },
      };

      axios
        .post(
          `https://www.virustotal.com/api/v3/domains/${sanitizedDomain}/comments`,
          voteData,
          {
            headers: headersWithVirusTotal,
          }
        )
        .catch((error) => {
          console.error(error);
        });
    },
  };
}

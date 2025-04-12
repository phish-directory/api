import { emails, rawAPIData } from "src/db/schema";
import { headers } from "src/defs/headers";
import { getDbDomain } from "src/func/db/domain";
import { getDbEmail } from "src/func/db/email";
import { axios } from "src/utils/axios";
import { db } from "src/utils/db";
import { sanitizeDomain } from "src/utils/sanitizeDomain";

/**
 * A service that provides access to the IpQualityScore service for checking and reporting domains.
 */
export class IpQualityScoreService {
  domain = {
    /**
     * Asynchronously checks a given domain against the IpQualityScore service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.ipqualityscore.domain.check");

      const sanitizedDomain = await sanitizeDomain(domain);

      const response = await axios.get(
        `https://ipqualityscore.com/api/json/url/${process.env
          .IPQS_API_KEY!}/${sanitizedDomain}`,
        {
          headers: headers,
        }
      );

      const data = response.data;
      const dbDomain = await getDbDomain(sanitizedDomain);

      await db.insert(rawAPIData).values({
        sourceAPI: "IpQualityScore",
        domain: dbDomain!.id!,
        data: data,
      });

      await db.insert(rawAPIData).values({
        sourceAPI: "IpQualityScore",
        domain: dbDomain!.id!,
        data: data,
      });

      return data;
    },
  };

  email = {
    /**
     * Asynchronously checks a given email against the IpQualityScore service for any known bad emails.
     *
     * @param {string} email - The email address to be checked.
     * @returns
     */
    check: async (email: string) => {
      // metrics.increment("services.ipqualityscore.email.check");

      let response = await axios.get(
        `https://ipqualityscore.com/api/json/email/${process.env
          .IPQS_API_KEY!}/${email}`,
        {
          headers: headers,
        }
      );

      let data = response.data;

      let dbEmail = await getDbEmail(email);

      if (!dbEmail) {
        dbEmail = await db.insert(emails).values({
          email: email,
          last_checked: new Date(),
        });
      }

      await db.insert(rawAPIData).values({
        sourceAPI: "IpQualityScore",
        email: dbEmail.id,
        data: data,
      });

      let keyData = {
        valid: data.valid,
        disposable: data.disposable,
        dns_valid: data.dns_valid,
        honeypot: data.honeypot,
        deliverability: data.deliverability,
        fraud_score: data.fraud_score,
      };

      return keyData;
    },
  };
}

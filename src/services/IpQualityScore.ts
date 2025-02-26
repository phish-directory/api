import axios from "axios";

import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";
import { headers } from "../utils/headers";
import { sanitizeDomain } from "../utils/sanitizeDomain";

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

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "IpQualityScore",
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

      let dbEmail = await prisma.email.findFirst({
        where: {
          email: email,
        },
      });

      if (!dbEmail) {
        dbEmail = await prisma.email.create({
          data: {
            email: email,
          },
        });
      }

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "IpQualityScore",
          email: {
            connect: {
              id: dbEmail.id,
            },
          },
          data: data,
        },
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

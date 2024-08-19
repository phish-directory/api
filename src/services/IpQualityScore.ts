import axios from "axios";

import { prisma } from "../prisma";
import metrics from "../metrics";
import { getDbDomain } from "../functions/db/getDbDomain";

/**
 * A service that provides access to the IpQualityScore service for checking and reporting domains.
 */
export class IpQualityScoreService {
  /**
   * Asynchronously checks a given domain against the IpQualityScore service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns
   */
  async domainCheck(domain: string) {
    metrics.increment("domain.check.api.ipqualityscore");

    const response = await axios.get(
      `https://ipqualityscore.com/api/json/url/${process.env
        .IPQS_API_KEY!}/${domain}`,
      {
        // todo: extract headers to a seperate place to avoid duplication
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    const data = response.data;
    const dbDomain = await getDbDomain(domain);

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
  }

  async emailCheck(email: string) {
    let response = await axios.get(
      `https://ipqualityscore.com/api/json/email/${process.env
        .IPQS_API_KEY!}/${email}`,
      {
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    let data = response.data;

    let keyData = {
      valid: data.valid,
      disposable: data.disposable,
      dns_valid: data.dns_valid,
      honeypot: data.honeypot,
      deliverability: data.deliverability,
      fraud_score: data.fraud_score,
    };

    return keyData;
  }
}

import axios from "axios";
import metrics from "../metrics";

/**
 * A service that provides access to the IpQualityScore service for checking and reporting domains.
 */
export class IpQualityScoreService {
  /**
   * Asynchronously checks a given domain against the IpQualityScore service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async domainCheck(domain: string, prisma: any) {
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

    return response.data;
  }

  async emailCheck(email: string, prisma: any) {
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

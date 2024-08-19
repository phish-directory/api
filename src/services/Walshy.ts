import axios from "axios";

import { getDbDomain } from "../functions/db/getDbDomain";
import metrics from "../metrics";
import { prisma } from "../prisma";

/**
 * A service that provides access to the walshy service for checking and reporting domains.
 */
export class WalshyService {
  /**
   * Asynchronously checks a given domain against the walshy service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   */
  async check(domain: string) {
    metrics.increment("domain.check.api.walshy");

    const response = await axios.post<{
      badDomain: boolean;
      detection: "discord" | "community";
    }>("https://bad-domains.walshy.dev/check", {
      // todo: extract headers to a seperate place to avoid duplication
      headers: {
        Referer: "https://phish.directory",
        "User-Agent": "internal-server@phish.directory",
        "X-Identity": "internal-server@phish.directory",
      },
      domain: domain,
    });

    const data = response.data;
    const dbDomain = await getDbDomain(domain);

    await prisma.rawAPIData.create({
      data: {
        sourceAPI: "Walshy",
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

  // todo: log report counts and data to the database
  /**
   * Asynchronously reports a given domain to the walshy service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @returns A promise that resolves when the report operation is complete.
   */
  async report(domain: string) {
    metrics.increment("domain.report.api.walshy");

    const response = await axios.post(
      `https://bad-domains.walshy.dev/report`,
      {
        domain: domain,
      },
      {
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    return response.data;
  }
}

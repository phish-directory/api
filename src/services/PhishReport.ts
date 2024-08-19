import axios from "axios";

import { prisma } from "../prisma";
import metrics from "../metrics";
import { getDbDomain } from "../functions/db/getDbDomain";

/**
 * A service that provides access to the PhishReport service for checking and reporting domains.
 */
export class PhishReportService {
  /**
   * Asynchronously checks a given domain against the PhishReport service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns
   */
  async check(domain: string) {
    metrics.increment("domain.check.api.phishreport");

    let response = await axios.get(
      `https://phish.report/api/v0/hosting?url=${domain}`,
      {
        headers: {
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    let data = response.data;
    let dbDomain = await getDbDomain(domain);

    await prisma.rawAPIData.create({
      data: {
        sourceAPI: "PhishReport",
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

  /**
   * Asynchronously reports a given domain to the PhishReport service for further processing or analysis.
   *
   * @param {string} domain - The domain name to be reported.
   * @returns
   */
  async report(domain: string) {
    metrics.increment("domain.report.api.phishreport");

    // todo: implement this
    // https://phish.report/api/v0#tag/Takedown/paths/~1api~1v0~1cases/post
  }
}

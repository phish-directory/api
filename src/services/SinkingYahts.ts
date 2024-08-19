import axios from "axios";

import metrics from "../metrics";
import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";

/**
 * A service that provides access to the SinkingYahts service for checking and reporting domains.
 */
export class SinkingYahtsService {
  /**
   * Asynchronously checks a given domain against the SinkingYahts service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns
   */
  async check(domain: string) {
    metrics.increment("domain.check.api.sinkingyahts");

    const response = await axios.get<boolean>(
      `https://phish.sinking.yachts/v2/check/${domain}`,
      {
        headers: {
          accept: "application/json",
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
        sourceAPI: "SinkingYachts",
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
}

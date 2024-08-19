import axios from "axios";

import { prisma } from "../prisma";
import { getDbDomain } from "../functions/db/getDbDomain";
import metrics from "../metrics";

/**
 * A service that provides access to the UrlScan service for checking and reporting domains.
 */
export class UrlScanService {
  // todo: add verdicts as part of report

  /**
   * Asynchronously checks a given domain against the UrlScan service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @returns
   */
  async check(domain: string) {
    metrics.increment("domain.check.api.urlscan");

    const checkSearch = await axios.get(
      `https://urlscan.io/api/v1/search/?q=domain:${domain}`,
      {
        headers: {
          "API-Key": process.env.URLSCAN_API_KEY!,
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      },
    );

    // check if the link is not already scanned
    if (checkSearch.data.results.length === 0) {
      // if not scan the link, providing the api key
      const scan = await axios.post(
        "https://urlscan.io/api/v1/scan/",
        {
          url: domain,
          tags: ["https://phish.directory", "api.phish.directory"],
        },
        {
          headers: {
            "API-Key": process.env.URLSCAN_API_KEY!,
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
          },
        },
      );

      // wait 15 seconds for the scan to finish
      setTimeout(async () => {
        const scanResult = await axios.get(
          `https://urlscan.io/api/v1/result/${scan.data.uuid}/`,
          {
            headers: {
              "API-Key": process.env.URLSCAN_API_KEY!,
              Referer: "https://phish.directory",
              "User-Agent": "internal-server@phish.directory",
              "X-Identity": "internal-server@phish.directory",
            },
          },
        );

        if (!scanResult.data) throw new Error("UrlScan API returned no data");
        return scanResult.data;
      }, 15000);
    } else {
      const scanResult = await axios.get(
        `https://urlscan.io/api/v1/result/${checkSearch.data.results[0].task.uuid}/`,
        {
          headers: {
            "API-Key": process.env.URLSCAN_API_KEY!,
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
          },
        },
      );

      const dbDomain = await getDbDomain(domain);
      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "UrlScan",
          domain: {
            connect: {
              id: dbDomain.id,
            },
          },
          data: scanResult.data,
        },
      });

      return scanResult.data;
    }
  }
}

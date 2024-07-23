import axios from "axios";

/**
 * A service that provides access to the UrlScan service for checking and reporting domains.
 */
export class UrlScanService {
  /**
   * Asynchronously checks a given domain against the UrlScan service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: any) {
    const checkSearch = await axios.get(
      `https://urlscan.io/api/v1/search/?q=domain:${domain}`,
      {
        headers: {
          "API-Key": process.env.URLSCAN_API_KEY!,
          Referer: "https://phish.directory",
          "User-Agent": "internal-server@phish.directory",
          "X-Identity": "internal-server@phish.directory",
        },
      }
    );

    // check if the link is not already scanned
    if (checkSearch.data.results.length === 0) {
      // if not scan the link, providing the api key
      const scan = await axios.post(
        "https://urlscan.io/api/v1/scan/",
        {
          url: domain,
        },
        {
          headers: {
            "API-Key": process.env.URLSCAN_API_KEY!,
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
          },
        }
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
          }
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
        }
      );

      return scanResult.data;
    }
  }
}

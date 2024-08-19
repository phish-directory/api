import axios from "axios";

import metrics from "../metrics";
import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";

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
      metrics.increment("services.virustotal.domain.check");

      const response = await axios.get(
        `https://www.virustotal.com/api/v3/domains/${domain}`,
        {
          headers: {
            "x-apikey": process.env.VIRUS_TOTAL_API_KEY!,
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
          sourceAPI: "VirusTotal",
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

    /**
     * Asynchronously reports a given domain to the VirusTotal service for further processing or analysis.
     *
     * @param {string} domain - The domain name to be reported.
     * @returns
     */
    report: async (domain: string) => {
      metrics.increment("services.virustotal.domain.report");

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
          `https://www.virustotal.com/api/v3/domains/${domain}/comments`,
          commentData,
          {
            headers: {
              accept: "application/json",
              "x-apikey": process.env.VIRUS_TOTAL_API_KEY!,
              "content-type": "application/json",
              Referer: "https://phish.directory",
              "User-Agent": "internal-server@phish.directory",
              "X-Identity": "internal-server@phish.directory",
            },
          },
        )
        .then((response) => {
          // console.log(response.data);
        })
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
          `https://www.virustotal.com/api/v3/domains/${domain}/comments`,
          voteData,
          {
            headers: {
              accept: "application/json",
              "x-apikey": process.env.VIRUS_TOTAL_API_KEY!,
              "content-type": "application/json",
              Referer: "https://phish.directory",
              "User-Agent": "internal-server@phish.directory",
              "X-Identity": "internal-server@phish.directory",
            },
          },
        )
        .then((response) => {
          // console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });

      // todo: implement this
    },
  };
}

import { googleThreatTypes, urlParamString } from "../defs/misc";
import { getDbDomain } from "../func/db/getDbDomain";
import { axios } from "../utils/axios";
import { prisma } from "../utils/prisma";
import { sanitizeDomain } from "../utils/sanitizeDomain";

/**
 * A service that provides access to the Google Safebrowsing for checking and reporting domains.
 */
export class GoogleSafebrowsingService {
  domain = {
    /**
     * Asynchronously checks a given domain against the Google Safebrowsing service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      // metrics.increment("services.googleSafebrowsing.domain.check");

      const sanitizedDomain = await sanitizeDomain(domain);

      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process
          .env.GOOGLE_API_KEY!}`,
        {
          client: {
            clientId: `phish.directory API`,
            clientVersion: `${process.env.npm_package_version!}`,
          },
          threatInfo: {
            threatTypes: googleThreatTypes,
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [
              {
                url: sanitizedDomain,
              },
            ],
          },
        }
      );

      const response2 = await axios.get(
        `https://webrisk.googleapis.com/v1/uris:search?${urlParamString}&uri=${domain}&key=${process
          .env.GOOGLE_API_KEY!}`
      );

      const data = response.data;
      const data2 = response2.data;

      const dbDomain = await getDbDomain(sanitizedDomain);

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "SafeBrowsing",
          domain: {
            connect: {
              id: dbDomain.id,
            },
          },
          data: data,
        },
      });

      await prisma.rawAPIData.create({
        data: {
          sourceAPI: "GoogleWebRisk",
          domain: {
            connect: {
              id: dbDomain.id,
            },
          },
          data: data2,
        },
      });

      return data;
    },
  };
}

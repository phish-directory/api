import { getDbDomain } from "../func/db/getDbDomain";
import { sanitizeDomain } from "../func/domain/sanitizeDomain";
import { axios } from "../utils/axios";
import { prisma } from "../utils/prisma";

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
            clientId: `phish.directory`,
            clientVersion: `${process.env.npm_package_version!}`,
          },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
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

      const data = response.data;
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

      return data;
    },
  };
}

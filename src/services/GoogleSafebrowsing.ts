import { rawAPIData } from "src/db/schema";
import { googleThreatTypes, urlParamString } from "src/defs/misc";
import { getDbDomain } from "src/func/db/domain";
import { axios } from "src/utils/axios";
import { db } from "src/utils/db";
import { sanitizeDomain } from "src/utils/sanitizeDomain";

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

      await db.insert(rawAPIData).values({
        sourceAPI: "SafeBrowsing",
        domain: dbDomain!.id!,
        data: data,
      });

      await db.insert(rawAPIData).values({
        sourceAPI: "GoogleWebRisk",
        domain: dbDomain!.id!,
        data: data2,
      });

      return data;
    },
  };
}

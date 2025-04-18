import { rawAPIData } from "src/db/schema";
import { headers } from "src/defs/headers";
import { axios } from "src/utils/axios";
import { db } from "src/utils/db";

/**
 * A service that provides access to the IpQuery service for checking and reporting domains, emails, etc.
 */
export class IpQueryService {
  ip = {
    /**
     * Asynchronously runs data ops on a given ip address against the IpQuery service.
     *
     * @param {string} ip - The ip address to be checked.
     * @returns
     */
    dataQ: async (ip: string) => {
      // metrics.increment("services.ipquery.ip.dataQ");

      const data = await axios.get(`https://api.ipquery.io/${ip}`, {
        headers: headers,
      });

      // set json as response data
      const jsonData = data.data;

      await db.insert(rawAPIData).values({
        sourceAPI: "IpQuery",
        data: jsonData,
      });
    },
  };
}

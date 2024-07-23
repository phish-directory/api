import axios from "axios";

/**
 * A service that provides access to the SecurityTrails service for checking and reporting domains.
 */
export class SecurityTrailsService {
  /**
   * Asynchronously checks a given domain against the SecurityTrails service for any known bad domains.
   *
   * @param {string} domain - The domain name to be checked.
   * @param {} prisma - The Prisma client instance to use for database operations.
   * @returns
   */
  async check(domain: string, prisma: any) {
    const options = {
      method: "GET",
      url: `https://api.securitytrails.com/v1/domain/${domain}`,
      headers: {
        accept: "application/json",
        APIKEY: process.env.SECURITYTRAILS_API_KEY!,
      },
    };

    const response = await axios.request(options);

    return response.data;
  }
}

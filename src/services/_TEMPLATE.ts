import axios from "axios";

import { getDbDomain } from "../functions/db/getDbDomain";
import metrics from "../metrics";
import { prisma } from "../prisma";

/**
 * A service that provides access to the TEMPLATE service for checking and reporting domains, emails, etc.
 */
export class TEMPLATEService {
  domain = {
    /**
     * Asynchronously checks a given domain against the TEMPLATE service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns
     */
    check: async (domain: string) => {
      metrics.increment("services.template.domain.check");
      // Implement the check logic here
    },

    /**
     * Asynchronously reports a given domain to the TEMPLATE service for further processing or analysis.
     *
     * @param {string} domain - The domain name to be reported.
     * @returns
     */
    report: async (domain: string) => {
      metrics.increment("services.template.domain.report");
      // Implement the report logic here
    },
  };

  // You can add more entities like IP addresses, usernames, etc., in a similar fashion.
}

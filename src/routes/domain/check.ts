import axios from "axios";

import express from "express";
const router = express.Router();

import { domainCheck } from "../../functions/domain";
import { authenticateToken } from "../../functions/jwt";
import { parseData } from "../../functions/parseData";
import { userNeedsExtendedData } from "../../functions/userNeedsExtendedData";
import { prisma } from "../../prisma";

import { headersWithOTX } from "../../utils/headers";

/**
 * GET /domain/check
 * @summary Checks if a domain is phishing/malicious.
 * @description This endpoint checks if a domain is phishing/malicious.
 It will return a boolean value of true if it is phishing/malicious and false if it is not, and some other data.

 Internally, this queries multiple sources to check if the domain is phishing/malicious, including but not limited to:
    - Walshy's API
    - IPQualityScore
    - Google Safebrowsing
    - Sinking Yahts
    - PhishTank
    - OpenPhish
    - Lots more...

We also keep our own database of domains and their status, so we can return the status of the domain quickly if it has been checked before.

 * @tags Domain - Endpoints for checking / reporting domains.
 * @security BearerAuth
 * @param {string} domain.query.required - Domain to check
 * @param {boolean} extendData.query.optional - Optionally, request extra information about the domain (MAY HAVE LONGER RESPONSE TIME). You need special permissions to access this.
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * {
 *   "domain": "google.com",
 *   "phishing": false,
 *   "times": {
 *     "createdAt": "2024-08-14T00:00:00.000Z",
 *     "updatedAt": "2024-08-14T00:00:00.000Z",
 *     "lastChecked": "2024-08-14T00:00:00.000Z"
 *   }
 * }
 * @example response - 400 - Error: No domain parameter
 * "No domain parameter found"
 * @example response - 400 - Error: Invalid domain parameter
 * "Invalid domain parameter, should be a top level domain. Ex: google.com, amazon.com"
 */
router.get("/", authenticateToken, async (req, res) => {
  // metrics.increment("endpoint.domain.check");

  // look for the query parameter
  const query = req.query!;

  let domain: string = query.domain! as string;
  let extendData = await userNeedsExtendedData(req);

  // check for domain parameter
  if (!domain || domain === "" || domain === undefined || domain === null) {
    return res.status(400).json("No domain parameter found");
  }

  // validate the domain (should be a top level domain
  // and not a subdomain
  // ex: google.com amazn.com
  // not: mail.google.com, docs.google.com)

  let regex = new RegExp("^(?!http://|https://)[a-zA-Z0-9-]+.[a-zA-Z]{2,}$");
  if (!regex.test(domain)) {
    return res
      .status(400)
      .json(
        "Invalid domain parameter, should be a top level domain. Ex: google.com, amazon.com"
      );
  }

  let dbDomain = await prisma.domain.findFirst({
    where: {
      domain: domain,
    },
  });

  if (!dbDomain) {
    dbDomain = await prisma.domain.create({
      data: {
        domain: domain,
      },
    });

    let data = await domainCheck(domain);

    let walshyData = data.walshyData;
    let ipQualityScoreData = data.ipQualityScoreData;
    let googleSafebrowsingData = data.googleSafebrowsingData;
    let sinkingYahtsData = data.sinkingYahtsData;
    let virusTotalData = data.virusTotalData;
    let phishObserverData = data.phishObserverData;
    let urlScanData = data.urlScanData;
    let securitytrailsData = data.securitytrailsData;
    let phishreportData = data.phishreportData;

    let isPhish = await parseData(
      walshyData,
      ipQualityScoreData,
      googleSafebrowsingData,
      sinkingYahtsData,
      virusTotalData,
      phishObserverData,
      urlScanData,
      securitytrailsData,
      phishreportData
    );

    if (isPhish) {
      await prisma.domain.update({
        where: {
          id: dbDomain.id,
        },
        data: {
          malicious: true,
          lastChecked: new Date(),
        },
      });

      await axios.patch(
        "https://otx.alienvault.com/api/v1/pulses/6785dccb041b628fde283705",
        {
          indicators: {
            add: [
              {
                indicator: `${domain}`,
                type: "domain",
                role: "phishing",
              },
            ],
          },
        },
        {
          headers: headersWithOTX,
        }
      );

      let response = {
        domain: domain,
        phishing: true,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      };

      if (extendData) {
        let rawAPIData = await prisma.rawAPIData.findMany({
          where: {
            domainId: dbDomain.id,
          },
        });

        // push the raw data to the response
        response["rawData"] = rawAPIData;
      }

      return res.status(200).json(response);
    } else {
      await prisma.domain.update({
        where: {
          id: dbDomain.id,
        },
        data: {
          malicious: false,
          lastChecked: new Date(),
        },
      });

      let response = {
        domain: domain,
        phishing: false,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      };

      if (extendData) {
        let rawAPIData = await prisma.rawAPIData.findMany({
          where: {
            domainId: dbDomain.id,
          },
        });

        // push the raw data to the response
        response["rawData"] = rawAPIData;
      }

      return res.status(200).json(response);
    }
  } else {
    domainCheck(domain);

    if (dbDomain.malicious) {
      await axios.patch(
        "https://otx.alienvault.com/api/v1/pulses/6785dccb041b628fde283705",
        {
          indicators: {
            add: [
              {
                indicator: `${domain}`,
                type: "domain",
                role: "phishing",
              },
            ],
          },
        },
        {
          headers: headersWithOTX,
        }
      );

      let response = {
        domain: domain,
        phishing: true,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      };

      if (extendData) {
        let rawAPIData = await prisma.rawAPIData.findMany({
          where: {
            domainId: dbDomain.id,
          },
        });

        // push the raw data to the response
        response["rawData"] = rawAPIData;
      }

      return res.status(200).json(response);
    } else {
      let response = {
        domain: domain,
        phishing: false,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      };

      if (extendData) {
        let rawAPIData = await prisma.rawAPIData.findMany({
          where: {
            domainId: dbDomain.id,
          },
        });

        // push the raw data to the response
        response["rawData"] = rawAPIData;
      }

      return res.status(200).json(response);
    }
  }
});

export default router;

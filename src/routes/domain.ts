import axios from "axios";
import * as express from "express";
import * as jwt from "jsonwebtoken";

import { getDbDomain } from "../functions/db/getDbDomain";
import { domainCheck, domainReport } from "../functions/domain";
import { authenticateToken, getUserInfo } from "../functions/jwt";
import { parseData } from "../functions/parseData";
import { logRequest } from "../middleware/logRequest";
import { prisma } from "../prisma";
import { Classifications } from "../types/enums";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

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
router.get("/check", authenticateToken, async (req, res) => {
  // metrics.increment("endpoint.domain.check");

  // look for the query parameter
  const query = req.query!;

  let domain: string = query.domain! as string;

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
          headers: {
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
            "X-OTX-API-KEY": `${process.env.OTX_KEY!}`,
          },
        }
      );

      return res.status(200).json({
        domain: domain,
        phishing: true,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      });
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

      return res.status(200).json({
        domain: domain,
        phishing: false,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      });
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
          headers: {
            Referer: "https://phish.directory",
            "User-Agent": "internal-server@phish.directory",
            "X-Identity": "internal-server@phish.directory",
            "X-OTX-API-KEY": `${process.env.OTX_KEY!}`,
          },
        }
      );

      return res.status(200).json({
        domain: domain,
        phishing: true,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      });
    } else {
      return res.status(200).json({
        domain: domain,
        phishing: false,
        times: {
          createdAt: dbDomain.createdAt,
          updatedAt: dbDomain.updatedAt,
          lastChecked: dbDomain.lastChecked,
        },
      });
    }
  }
});

/**
 * Classification Type
 * @typedef {string} ClassificationType
 * @enum {string}
 * @property {string} postal - postal
 * @property {string} banking - banking
 * @property {string} item_scams - item_scams
 * @property {string} other - other
 */

/**
 * Domain Classification Body
 * @typedef {object} DomainClassification
 * @property {string} domain.required - Domain to classify
 * @property {ClassificationTyoe} classification.required - Classification to assign to the domain - eg: postal, banking, item_scams, other
 */

/**
 * PUT /domain/classify
 * @summary Classify a domain to specific types (scam, phishing, etc.)
 * @description Classify a domain to specific types (scam, phishing, etc.).
 The classification parameter should be one of the following: "postal", "banking", "item_scams", or "other".
 (Check the ClassificationType enum for more information) (see swagger ui)

 This endpoint requires TRUSTED level access. To check if you have this access run /user/me with your token.

 To request trusted level access or a new classification type, contact Jasper via email at jasper@phish.directory or via Slack.
 * @tags Domain - Endpoints for checking / reporting domains.
 * @security BearerAuth
 * @param {DomainClassification} request.body.required - Domain Classification Body
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * "Domain classified successfully"
 */
router.put("/classify", authenticateToken, async (req, res) => {
  const data = req.body;
  const domain = data.domain;
  const classification = data.classification;

  if (!domain) {
    return res.status(400).json("No domain parameter found");
  }

  if (!classification) {
    return res.status(400).json("No classification parameter found");
  }

  // validate classification against enum
  if (!Object.values(Classifications).includes(classification)) {
    return res.status(400).json("Invalid classification parameter");
  }

  // get authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  // decode the token
  let decoded = jwt.decode(token);

  if (!decoded) {
    return res.status(400).json("Invalid token");
  }

  let user = await prisma.user.findUnique({
    where: {
      // @ts-expect-error
      id: decoded.id,
    },
  });

  if (!user) {
    return res.status(400).json("User not found");
  }

  let trustedTypes = ["trusted", "admin"];

  if (user.permission !== "basic" && trustedTypes.includes(user.permission)) {
    let dbDomain = await prisma.domain.findFirst({
      where: {
        domain: domain,
      },
    });

    let databaseDomain = await prisma.domain.findFirst({
      where: {
        domain: domain,
      },
    });

    if (!databaseDomain) {
      databaseDomain = await prisma.domain.create({
        data: {
          domain: domain,
        },
      });
    }

    await prisma.classification.create({
      data: {
        domain: {
          connect: {
            id: databaseDomain.id,
          },
        },
        classifier: {
          connect: {
            id: user.id,
          },
        },
        classification: classification,
      },
    });

    return res.status(200).json("Domain classified successfully");
  } else {
    console.log(user.permission);
    return res.status(403).json("Unauthorized");
  }
});

/**
 * POST /domain/report
 * @summary Report a domain as malicious
 * @description Reports a domain as potentially malicious. Submissions will be reviewed by a trusted user before being marked and submitted into our database.
 * @tags Domain - Endpoints for checking / reporting domains.
 * @security BearerAuth
 * @param {DomainReport} request.body.required - Domain report details
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 * @example request - Domain report
 * {
 *   "domain": "malicious-site.com",
 *   "notes": "This site is attempting to steal banking credentials"
 * }
 */
router.post("/report", authenticateToken, async (req, res) => {
  const { domain, notes } = req.body;
  const user = await getUserInfo(prisma, res, req);

  if (!domain) {
    return res.status(400).json("No domain parameter found");
  }

  // Get or create domain record
  let dbDomain = await getDbDomain(domain);

  // Create report
  const report = await prisma.domainReport.create({
    data: {
      domain: { connect: { id: dbDomain.id } },
      reporter: { connect: { id: user.id } },
      notes,
    },
  });

  // If user is trusted/admin, automatically approve and mark domain as malicious
  if (user.permission === "trusted" || user.permission === "admin") {
    await prisma.$transaction([
      prisma.domainReport.update({
        where: { id: report.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewer: { connect: { id: user.id } },
        },
      }),
      prisma.domain.update({
        where: { id: dbDomain.id },
        data: { malicious: true },
      }),
    ]);

    await domainReport(domain);

    return res.status(200).json("Domain reported and marked as malicious");
  }

  return res.status(200).json("Domain report submitted for review");
});

export default router;

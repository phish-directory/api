import * as express from "express";
import * as jwt from "jsonwebtoken";

import { domainCheck } from "../functions/domain";
import { authenticateToken } from "../functions/jwt";
import { parseData } from "../functions/parseData";
import metrics from "../metrics";
import { logRequest } from "../middleware/logRequest";
import { stripeMeter } from "../middleware/stripeMeter";
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

 * @tags Domain - Endpoints related to domain checking
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
router.get("/check", authenticateToken, stripeMeter, async (req, res) => {
  metrics.increment("endpoint.domain.check");

  // look for the query parameter
  const query = req.query!;

  let domain: string = query.domain! as string;

  // check for domain parameter
  if (!domain) {
    res.status(400).json("No domain parameter found");
  }

  // validate the domain (should be a top level domain
  // and not a subdomain
  // ex: google.com amazn.com
  // not: mail.google.com, docs.google.com)

  let regex = new RegExp("^(?!http://|https://)[a-zA-Z0-9-]+.[a-zA-Z]{2,}$");
  if (!regex.test(domain)) {
    res
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
    let phishermanData = data.phishermanData;
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
      phishermanData,
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
 * PUT /domain/classify
 * @summary Classify a domain to specific types (scam, phishing, etc.)
 * @description Classify a domain to specific types (scam, phishing, etc.).
 The classification parameter should be one of the following: "postal", "banking", "item_scams", or "other".

 This endpoint requires TRUSTED level access. To check if you have this access run /user/me with your token.

 To request trusted level access or a new classification type, contact Jasper via email at jasper@phish.directory or via Slack.
 * @tags Domain - Endpoints related to domain checking
 * @security BearerAuth
 * @body {string} domain - Domain to classify
 * @body {string} classification - Classification to assign to the domain
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * "Domain classified successfully"
 */
router.put("/classify", authenticateToken, stripeMeter, async (req, res) => {
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
      return res.status(400).json("Domain not found! Please run /check first.");
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

export default router;

import axios from "axios";
import * as express from "express";

import { domainCheck } from "../functions/domain";
import { authenticateToken } from "../functions/jwt";
import { parseData } from "../functions/parseData";
import { prisma } from "../prisma";

const router = express.Router();

enum Verdict {
  postal,
  banking,
  item_scams,
  other,
}

/**
 * GET /domain/check
 * @summary Checks if a domain is classified as something malicious (scam, phishing, etc.)
 * @tags Domain
 * @param {string} domain.query.required - domain to check
 * @return {string} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * "Check!"
 * @example response - 400 - Error: No domain parameter
 * "No domain parameter found"
 * @example response - 400 - Error: Invalid domain parameter
 * "Invalid domain parameter, should be a top level domain. Ex: google.com, amazon.com"
 *
 */
router.get("/check", authenticateToken, async (req, res) => {
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

  // if (!dbDomain) {
  dbDomain = await prisma.domain.create({
    data: {
      domain: domain,
    },
  });

  let data = await domainCheck(domain, dbDomain);

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
    urlScanData
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
      phishing: true,
      apiData: {
        googleSafebrowsing: googleSafebrowsingData,
        ipQualityScore: ipQualityScoreData,
        phisherman: phishermanData,
        phishObserver: phishObserverData,
        sinkingYahts: sinkingYahtsData,
        virusTotal: virusTotalData,
        walshy: walshyData,
        urlScan: urlScanData,
        securitytrails: securitytrailsData,
        phishReport: phishreportData,
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
      phishing: false,
      apiData: {
        googleSafebrowsing: googleSafebrowsingData,
        ipQualityScore: ipQualityScoreData,
        phisherman: phishermanData,
        phishObserver: phishObserverData,
        sinkingYahts: sinkingYahtsData,
        virusTotal: virusTotalData,
        walshy: walshyData,
        urlScan: urlScanData,
        securitytrails: securitytrailsData,
        phishReport: phishreportData,
      },
    });
  }
  // } else {
  //   if (dbDomain.malicious) {
  //     return res.status(200).json({
  //       phishing: true,
  //       apiData: {
  //         googleSafebrowsing:
  //           await prisma.googleSafeBrowsingAPIResponse.findFirst({
  //             where: {
  //               domainId: dbDomain.id,
  //             },
  //           }),
  //         ipQualityScore: await prisma.ipQualityScoreAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         phisherman: await prisma.phishermanAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         phishObserver: await prisma.phishObserverAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         sinkingYahts: await prisma.sinkingYachtsAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         virusTotal: await prisma.virusTotalAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         walshy: await prisma.walshyAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         urlScan: await prisma.urlScanAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         securitytrails: await prisma.securityTrailsAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         phishReport: await prisma.phishReportAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //       },
  //     });
  //   } else {
  //     return res.status(200).json({
  //       phishing: false,
  //       apiData: {
  //         googleSafebrowsing:
  //           await prisma.googleSafeBrowsingAPIResponse.findFirst({
  //             where: {
  //               domainId: dbDomain.id,
  //             },
  //           }),
  //         ipQualityScore: await prisma.ipQualityScoreAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         phisherman: await prisma.phishermanAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         phishObserver: await prisma.phishObserverAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         sinkingYahts: await prisma.sinkingYachtsAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         virusTotal: await prisma.virusTotalAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         walshy: await prisma.walshyAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         urlScan: await prisma.urlScanAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         securitytrails: await prisma.securityTrailsAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //         phishReport: await prisma.phishReportAPIResponse.findFirst({
  //           where: {
  //             domainId: dbDomain.id,
  //           },
  //           orderBy: {
  //             createdAt: "desc",
  //           },
  //         }),
  //       },
  //     });
  //   }
  // }
});

// /**
//  * POST /domain/report
//  * @summary Report a domain as malicious
//  * @tags Domain
//  * @return {string} 200 - Success message
//  * @return {string} 400 - Error message
//  * @example response - 200 - Success message
//  * "Report!"
//  */
router.post("/report", authenticateToken, (req, res) => {
  let query = req.query;

  let domain: string = query.domain! as string;

  // check for domain parameter
  if (!domain) {
    res.status(400).json("No domain parameter found");
  }

  // get the userid from the token
  let user;
});

router.post("/verdict", async (req, res) => {
  const query = req.query;

  let { domain, verdict, suser } = query;
  domain = domain as string;
  verdict = verdict as string;
  suser = suser as string;

  // check for the KEY parameter
  if (process.env.PHISHBOT_KEY !== req.query.key) {
    return res.status(401).json("Unauthorized");
  }

  if (!req.query.domain) {
    return res.status(400).json("Missing domain");
  }

  if (!req.query.verdict) {
    return res.status(400).json("Missing verdict");
  }

  if (!req.query.suser) {
    return res.status(400).json("Missing user");
  }

  // convert verdict to type Verdict
  let v: Verdict;

  switch (verdict) {
    case "postal":
      v = Verdict.postal;
      break;
    case "banking":
      v = Verdict.banking;
      break;
    case "item_scams":
      v = Verdict.item_scams;
      break;
    case "other":
      v = Verdict.other;
      break;
    default:
      return res.status(400).json("Invalid verdict");
  }

  let dbDomain = await prisma.domain.findFirst({
    where: {
      domain: domain,
    },
  });

  if (!dbDomain) {
    // make a request to the domain/check endpoint
    // to check the domain

    await axios.get(
      `http://localhost:${process.env.PORT!}/domain/check?domain=${domain}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
        },
      }
    );

    dbDomain = await prisma.domain.findFirst({
      where: {
        domain: domain,
      },
    });
  }

  await prisma.tmpVerdict
    .create({
      data: {
        domain: {
          connect: {
            id: dbDomain!.id,
          },
        },
        verdict: verdict,
        sUser: suser,
      },
    })
    .then(() => {
      return res.status(200).json("Verdict added");
    })
    .catch((err) => {
      return res.status(500).json("Failed to add verdict");
    });
});

export default router;

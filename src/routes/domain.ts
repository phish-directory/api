import { PrismaClient } from "@prisma/client";
import axios from "axios";
import * as express from "express";

import { authenticateToken } from "../functions/jwt";
import { parseData } from "../functions/parseData";
import { GoogleSafebrowsingService } from "../services/GoogleSafebrowsing";
import { IpQualityScoreService } from "../services/IpQualityScore";
import { PhishObserverService } from "../services/PhishObserver";
import { PhishermanService } from "../services/Phisherman";
import { SinkingYahtsService } from "../services/SinkingYahts";
import { VirusTotalService } from "../services/VirusTotal";
import { WalshyService } from "../services/Walshy";

const router = express.Router();
const prisma = new PrismaClient();

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

  let regex = new RegExp("^[a-zA-Z0-9-]{1,63}.[a-zA-Z]{2,}$");
  if (!regex.test(domain)) {
    res
      .status(400)
      .json(
        "Invalid domain parameter, should be a top level domain. Ex: google.com, amazon.com",
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

    const walshy = new WalshyService();
    const ipQualityScore = new IpQualityScoreService();
    const googleSafebrowsing = new GoogleSafebrowsingService();
    const sinkingYahts = new SinkingYahtsService();
    const virusTotal = new VirusTotalService();
    const phisherman = new PhishermanService();
    const phishObserver = new PhishObserverService();

    let walshyData = await walshy.check(domain, prisma);
    let ipQualityScoreData = await ipQualityScore.check(domain, prisma);
    let googleSafebrowsingData = await googleSafebrowsing.check(domain, prisma);
    let sinkingYahtsData = await sinkingYahts.check(domain, prisma);
    let virusTotalData = await virusTotal.check(domain, prisma);
    let phishermanData = await phisherman.check(domain, prisma);
    let phishObserverData = await phishObserver.check(domain, prisma);

    let dbGbsResponse = await prisma.googleSafeBrowsingAPIResponse.create({
      data: {
        domain: {
          connect: {
            id: dbDomain.id,
          },
        },
        data: googleSafebrowsingData,
      },
    });

    let dbIpQualityScoreResponse =
      await prisma.ipQualityScoreAPIResponse.create({
        data: {
          domain: {
            connect: {
              id: dbDomain.id,
            },
          },
          proxy: ipQualityScoreData.proxy ? true : false,
          countryCode: ipQualityScoreData.country_code,
          data: ipQualityScoreData,
        },
      });

    for (const [domain, data] of Object.entries(phishermanData)) {
      const typedData = data as any;

      const dbPhishermanResponse = await prisma.phishermanAPIResponse.create({
        data: {
          domain: {
            connect: {
              id: dbDomain.id,
            },
          },
          classification: typedData.classification,
          verifiedPhish: typedData.verifiedPhish,
          data: typedData,
        },
      });
    }

    let dbSinkingYahtsResponse = await prisma.sinkingYachtsAPIResponse.create({
      data: {
        domain: {
          connect: {
            id: dbDomain.id,
          },
        },
        data: sinkingYahtsData,
        status: sinkingYahtsData,
      },
    });

    let dbVirusTotalResponse = await prisma.virusTotalAPIResponse.create({
      data: {
        domain: {
          connect: {
            id: dbDomain.id,
          },
        },
        data: virusTotalData,
        // virusTotalData.data.attributes.last_analysis_stats.malicious is 0 if false and 1 if true, convert to boolean
        malicious: virusTotalData.data.attributes.last_analysis_stats.malicious
          ? true
          : false,
        suspicious: virusTotalData.data.attributes.last_analysis_stats
          .suspicious
          ? true
          : false,
      },
    });

    let dbWalshyResponse = await prisma.walshyAPIResponse.create({
      data: {
        domain: {
          connect: {
            id: dbDomain.id,
          },
        },
        badDomain: walshyData.badDomain,
        data: walshyData as any,
      },
    });

    // convert phishObserver data to json
    let pojson = JSON.stringify(phishObserverData);

    let phishObserverResponse = await prisma.phishObserverAPIResponse.create({
      data: {
        domain: {
          connect: {
            id: dbDomain.id,
          },
        },
        data: pojson,
      },
    });

    let isPhish = await parseData(
      walshyData,
      ipQualityScoreData,
      googleSafebrowsingData,
      sinkingYahtsData,
      virusTotalData,
      phishermanData,
      phishObserverData,
    );

    if (isPhish) {
      await prisma.domain.update({
        where: {
          id: dbDomain.id,
        },
        data: {
          malicious: true,
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
        },
      });
    } else {
      await prisma.domain.update({
        where: {
          id: dbDomain.id,
        },
        data: {
          malicious: false,
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
        },
      });
    }
  } else {
    return res.status(200).json("Domain already checked");
  }

  // res.status(200).json({
  //   walshy: walshyData,
  //   ipQualityScore: ipQualityScoreData,
  //   googleSafebrowsing: googleSafebrowsingData,
  //   sinkingYahts: sinkingYahtsData,
  //   virusTotal: virusTotalData,
  //   phisherman: phishermanData,
  //   phishObserver: phishObserverData,
  // });
});

export default router;

/**
 * POST /domain/report
 * @summary Report a domain as malicious
 * @tags Domain
 * @return {string} 200 - Success message
 * @return {string} 400 - Error message
 * @example response - 200 - Success message
 * "Report!"
 */
router.post("/report", authenticateToken, (req, res) => {
  res.status(200).json("Report!");
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
      },
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

import { PrismaClient } from "@prisma/client";
import * as express from "express";

import { GoogleSafebrowsingService } from "../services/GoogleSafebrowsing";
import { IpQualityScoreService } from "../services/IpQualityScore";
import { PhishermanService } from "../services/Phisherman";
import { SinkingYahtsService } from "../services/SinkingYahts";
import { VirusTotalService } from "../services/VirusTotal";
import { WalshyService } from "../services/Walshy";

const router = express.Router();
const prisma = new PrismaClient();

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
router.get("/check", async (req, res) => {
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

  const walshy = new WalshyService();
  const ipQualityScore = new IpQualityScoreService();
  const googleSafebrowsing = new GoogleSafebrowsingService();
  const sinkingYahts = new SinkingYahtsService();
  const virusTotal = new VirusTotalService();
  const phisherman = new PhishermanService();

  let walshyData = await walshy.check(domain, prisma);
  let ipQualityScoreData = await ipQualityScore.check(domain, prisma);
  let googleSafebrowsingData = await googleSafebrowsing.check(domain, prisma);
  let sinkingYahtsData = await sinkingYahts.check(domain, prisma);
  let virusTotalData = await virusTotal.check(domain, prisma);
  let phishermanData = await phisherman.check(domain, prisma);

  // let dbDomain = await prisma.domain.findUnique({
  //   // @ts-expect-error
  //   where: {
  //     domain: domain,
  //   },
  // });

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
  }

  // todo: figure out why ts is complaining about this
  // @ts-expect-error
  let dbGbsResponse = await prisma.GoogleSafeBrowsingAPIResponse.create({
    data: {
      domain: {
        connect: {
          id: dbDomain.id,
        },
      },
      data: googleSafebrowsingData,
    },
  });

  // todo: figure out why ts is complaining about this
  // @ts-expect-error
  let dbIpQualityScoreResponse = await prisma.IpQualityScoreAPIResponse.create({
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
    // todo: figure out why ts is complaining about this
    // @ts-expect-error
    const dbPhishermanResponse = await prisma.PhishermanAPIResponse.create({
      data: {
        domain: {
          connect: {
            id: dbDomain.id,
          },
        },
        // @ts-expect-error
        classification: data.classification,
        // @ts-expect-error
        verifiedPhish: data.verifiedPhish,
        data: data,
      },
    });
  }

  // todo: figure out why ts is complaining about this
  // @ts-expect-error
  let dbSinkingYahtsResponse = await prisma.SinkingYachtsAPIResponse.create({
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

  // todo: figure out why ts is complaining about this
  // @ts-expect-error
  let dbVirusTotalResponse = await prisma.VirusTotalAPIResponse.create({
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
      suspicious: virusTotalData.data.attributes.last_analysis_stats.suspicious
        ? true
        : false,
    },
  });

  // todo: figure out why ts is complaining about this
  // @ts-expect-error
  let dbWalshyResponse = await prisma.WalshyAPIResponse.create({
    data: {
      domain: {
        connect: {
          id: dbDomain.id,
        },
      },
      badDomain: walshyData.badDomain,
      data: walshyData,
    },
  });

  res.status(200).json({
    walshy: walshyData,
    ipQualityScore: ipQualityScoreData,
    googleSafebrowsing: googleSafebrowsingData,
    sinkingYahts: sinkingYahtsData,
    virusTotal: virusTotalData,
    phisherman: phishermanData,
  });
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
router.post("/report", (req, res) => {
  res.status(200).json("Report!");
});
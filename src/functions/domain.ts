import puppeteer from "puppeteer";

import metrics from "../metrics";
import { prisma } from "../prisma";
import {
  walshyService,
  ipQualityScoreService,
  googleSafebrowsingService,
  sinkingYahtsService,
  virusTotalService,
  phishermanService,
  phishObserverService,
  urlScanService,
  securityTrailsService,
  phishReportService,
} from "../services/_index";

/**
 * Check the domain against all the services
 * @param domain - Domain to check
 * @param dbDomain - Domain from the database
 * @returns void
 */
export async function domainCheck(domain: string) {
  const tsStart = Date.now();
  metrics.increment("functions.domainCheck");

  let walshyData = await walshyService.check(domain);
  let ipQualityScoreData = await ipQualityScoreService.domainCheck(domain);
  let googleSafebrowsingData = await googleSafebrowsingService.check(domain);
  let sinkingYahtsData = await sinkingYahtsService.check(domain);
  let virusTotalData = await virusTotalService.check(domain);
  let phishermanData = await phishermanService.check(domain);
  let phishObserverData = await phishObserverService.check(domain);
  let urlScanData = await urlScanService.check(domain);
  let securitytrailsData = await securityTrailsService.check(domain);
  let phishreportData = await phishReportService.check(domain);

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

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: "shell" });
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(`https://${domain}`, {
    waitUntil: "networkidle2",
  });

  // Set screen size.
  await page.setViewport({ width: 1080, height: 1024 });

  // Capture screenshot to a buffer
  let pageimgBuffer = await page.screenshot({
    type: "png",
    encoding: "binary",
  });

  await prisma.capture.create({
    data: {
      domain: {
        connect: {
          id: dbDomain.id,
        },
      },
      binary: pageimgBuffer,
    },
  });

  await browser.close();
  metrics.timing("functions.timing.domainCheck", Date.now() - tsStart);

  return {
    walshyData,
    ipQualityScoreData,
    googleSafebrowsingData,
    sinkingYahtsData,
    virusTotalData,
    phishermanData,
    phishObserverData,
    urlScanData,
    securitytrailsData,
    phishreportData,
  };
}

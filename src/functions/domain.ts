import axios from "axios";

// import metrics from "../metrics";
import { prisma } from "../prisma";
import {
  googleSafebrowsingService,
  ipQualityScoreService,
  phishObserverService,
  phishReportService,
  securityTrailsService,
  sinkingYahtsService,
  urlScanService,
  virusTotalService,
  walshyService,
} from "../services/_index";

/**
 * Check the domain against all the services
 * @param domain - Domain to check
 * @returns void
 */
export async function domainCheck(domain: string) {
  const tsStart = Date.now();
  // metrics.increment("functions.domainCheck");

  let walshyData = await walshyService.domain.check(domain);
  let ipQualityScoreData = await ipQualityScoreService.domain.check(domain);
  let googleSafebrowsingData = await googleSafebrowsingService.domain.check(
    domain
  );
  let sinkingYahtsData = await sinkingYahtsService.domain.check(domain);
  let virusTotalData = await virusTotalService.domain.check(domain);
  let phishObserverData = await phishObserverService.domain.check(domain);
  let urlScanData = await urlScanService.domain.check(domain);
  let securitytrailsData = await securityTrailsService.domain.check(domain);
  let phishreportData = await phishReportService.domain.check(domain);

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

  // let browser;

  // if (process.env.NODE_ENV === "development") {
  //   browser = await chromium.launch();
  // } else {
  //   browser = await chromium.launch({
  //     executablePath: "/usr/bin/chromium-browser",
  //     args: [
  //       "--disable-dev-shm-usage",
  //       "--disable-setuid-sandbox",
  //       "--no-sandbox",
  //     ],
  //     chromiumSandbox: false,
  //   });
  // }

  // const context = await browser.newContext();
  // const page = await context.newPage();

  // // Navigate to the domain
  // await page.goto(`https://${domain}`, {
  //   // waitUntil: "networkidle",
  // });

  // const pageimgBuffer = await page.screenshot({
  //   type: "png",
  // });

  // console.log("\n");
  // console.log(pageimgBuffer);
  // console.log("\n");

  // // Save to database
  // await prisma.capture.create({
  //   data: {
  //     domain: {
  //       connect: {
  //         id: dbDomain.id,
  //       },
  //     },
  //     binary: pageimgBuffer,
  //   },
  // });

  // // Clean up
  // await context.close();
  // await browser.close();

  // metrics.timing("functions.timing.domainCheck", Date.now() - tsStart);

  return {
    walshyData,
    ipQualityScoreData,
    googleSafebrowsingData,
    sinkingYahtsData,
    virusTotalData,
    phishObserverData,
    urlScanData,
    securitytrailsData,
    phishreportData,
  };
}

/**
* Report the domain to all services that support reporting
@param domain
@returns void
*/
export async function domainReport(domain: string) {
  let virustotaldata = await virusTotalService.domain.report(domain);
  let walshydata = await walshyService.domain.report(domain);

  await axios.patch(
    "https://otx.alienvault.com/api/v1/pulses/6785dccb041b628fde283705",
    {
      indicators: {
        add: [
          {
            indicator: `${domain}`,
            type: "domain",
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

  return {
    virustotaldata,
    walshydata,
  };
}

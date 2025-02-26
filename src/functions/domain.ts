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
import { headersWithOTX } from "../utils/headers";

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
      headers: headersWithOTX,
    }
  );

  return {
    virustotaldata,
    walshydata,
  };
}

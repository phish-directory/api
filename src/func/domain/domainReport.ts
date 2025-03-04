import { axios } from "../../utils/axios";

import { headersWithOTX } from "../../../src/defs/headers";
import { virusTotalService, walshyService } from "../../services/_index";

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

import axios from "axios";
import { headersWithOTX } from "../../defs/headers";

/**
 * Reports a malicious domain to AlienVault OTX
 * @param {string} domain - Domain to report
 */
export async function reportToAlienVault(domain) {
  try {
    await axios.patch(
      "https://otx.alienvault.com/api/v1/pulses/6785dccb041b628fde283705",
      {
        indicators: {
          add: [
            {
              indicator: domain,
              type: "domain",
              role: "phishing",
            },
          ],
        },
      },
      { headers: headersWithOTX }
    );
  } catch (error) {
    console.error(`Failed to report domain ${domain} to AlienVault:`, error);
  }
}

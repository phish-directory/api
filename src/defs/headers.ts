export const headers = {
  Referer: "https://phish.directory",
  "User-Agent": "internal-server@phish.directory",
  "X-Identity": "internal-server@phish.directory",
};

export const applicationJsonHeaders = {
  accept: "application/json",
};

export const headersWithOTX = {
  ...headers,
  "X-OTX-API-KEY": `${process.env.OTX_KEY!}`,
};

export const headersWithPhishObserver = {
  ...headers,
  Authorization: `Bearer ${process.env.PHISH_OBSERVER_API_KEY!}`,
};

export const headersWithSecurityTrails = {
  ...headers,
  ...applicationJsonHeaders,
  APIKEY: process.env.SECURITYTRAILS_API_KEY!,
};

export const headersWithSinkingYahts = {
  ...headers,
  ...applicationJsonHeaders,
};

export const headersWithUrlScan = {
  ...headers,
  "API-Key": process.env.URLSCAN_API_KEY!,
};

export const headersWithVirusTotal = {
  ...headers,
  "x-apikey": process.env.VIRUS_TOTAL_API_KEY!,
};

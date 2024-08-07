import * as dotenv from "dotenv";
import express from "express";
import expressJSDocSwagger from "express-jsdoc-swagger";
import helmet from "helmet";
import { CronJob } from "cron";
import axios from "axios";

import router from "./router";
import { swaggerOptions } from "./swaggerOptions";
import * as logger from "./utils/logger";
import metrics from "./metrics";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

expressJSDocSwagger(app)(swaggerOptions);

app.use(
  helmet({
    xFrameOptions: { action: "deny" },
    xContentTypeOptions: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "strict-origin" },
    strictTransportSecurity: {
      maxAge: 63072000,
      preload: true,
    },
  }),
);

// Add metric interceptors for axios
axios.interceptors.request.use((config: any) => {
  config.metadata = { startTs: performance.now() };
  return config;
});

axios.interceptors.response.use((res: any) => {
  const stat = (res.config.method + "/" + res.config.url?.split("/")[1])
    .toLowerCase()
    .replace(/[:.]/g, "")
    .replace(/\//g, "_");

  const httpCode = res.status;
  const timingStatKey = `http.request.${stat}`;
  const codeStatKey = `http.request.${stat}.${httpCode}`;
  metrics.timing(
    timingStatKey,
    performance.now() - res.config.metadata.startTs,
  );
  metrics.increment(codeStatKey, 1);

  return res;
});

app.use("/", router);

// todo: @cron to run every 12 hours to pull a feed from https://openphish.com/phishing_feeds.html
// todo: build domain confirmation system
// todo: scope for url and domain (both are different!)
// todo: add regex to domain ( ^(?!http:\/\/|https:\/\/)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$ )
// todo: implement token refresh system
// todo: use puppeteer to check if a domain is a phishing site
// todo: speed things up by returning last cached result if the domain is already scanned (still run scans after)

/* todo: list for implements:
- https://phish.report/
- https://phish.observer/
- https://phish.report/api/v0#tag/Takedown/paths/~1api~1v0~1cases/get
- https://urlhaus-api.abuse.ch/
- https://openphish.com/
- https://report.netcraft.com/api/v3#tag/Report/paths/~1report~1mistake/post
- https://any.run/api-documentation/
- https://phishstats.info/
- https://pulsedive.com/api/
- https://whoisjsonapi.com/
- https://whoisfreaks.com/
*/

// console.log(new Date().getTime());

// run cron every 1 sec
new CronJob(
  "* * * * * *",
  async function () {
    console.log("Thump Thump");
    metrics.increment("heartbeat");
  },
  null,
  true,
  "America/New_York",
);

// Heartbeat
// new CronJob(
//   "0 * * * * *",
//   async function () {
//     console.log("Thump Thump");
//     metrics.increment("heartbeat");
//   },
//   null,
//   true,
//   "America/New_York",
// );

app.listen(port, () => {
  metrics.increment("app.startup");
  logger.info(`Server is running on port ${port}`);
});

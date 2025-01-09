import axios from "axios";
import * as dotenv from "dotenv";
import expressJSDocSwagger from "express-jsdoc-swagger";
import helmet from "helmet";

import { app } from "./app";
import router from "./router";
import { server } from "./server";
// import metrics from "./metrics";
import { swaggerOptions as adminSwagOptions } from "./routes/admin/swaggerOptions";
import { swaggerOptions as mainSwagOptions } from "./swaggerOptions";
import * as logger from "./utils/logger";

dotenv.config();

const port: number = Number(process.env.PORT) || 3000;

expressJSDocSwagger(app)(mainSwagOptions);
expressJSDocSwagger(app)(adminSwagOptions);

app.disable("x-powered-by");

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
    xPoweredBy: false,
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
  // metrics.timing(
  //   timingStatKey,
  //   performance.now() - res.config.metadata.startTs
  // );
  // // metrics.increment(codeStatKey, 1);

  return res;
});

app.use("/", router);

// todo: @cron to run every 12 hours to pull a feed from https://openphish.com/phishing_feeds.html
// todo: build domain confirmation system
// todo: scope for url and domain (both are different!)
// todo: add regex to domain ( ^(?!http:\/\/|https:\/\/)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$ )
// todo: speed things up by returning last cached result if the domain is already scanned (still run scans after)
// todo: email report ~ https://ipqualityscore.com/api/json/report/8I8oBoRCoJpeVkGax4utD5tDDzVTt78m?email=bad_email@example.com

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
// new CronJob(
//   "* * * * * *",
//   async function () {
//     console.log("Thump Thump");
//     // metrics.increment("heartbeat");
//   },
//   null,
//   true,
//   "America/New_York",
// );

// Heartbeat
// new CronJob(
//   "0 * * * * *",
//   async function () {
//     console.log("Thump Thump");
//     // metrics.increment("heartbeat");
//   },
//   null,
//   true,
//   "America/New_York",
// );
//

server.listen(port, "0.0.0.0", () => {
  logger.info(`Server is running on port ${port}`);
});

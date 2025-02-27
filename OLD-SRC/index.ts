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
  })
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
  // metrics.increment(codeStatKey, 1);

  return res;
});

app.use("/", router);

// Heartbeat
// new CronJob(
//   "0 * * * * *",
//   async function () {
//     logger.log("Thump Thump");
//     // metrics.increment("heartbeat");
//   },
//   null,
//   true,
//   "America/New_York",
// );
//

server
  .listen(Number(port), "0.0.0.0", () => {
    logger.info(`Server is running on port ${port}`);
  })
  .on("error", (err) => {
    logger.error(`Failed to start server: ${err.message}`);
  });

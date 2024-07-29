import * as dotenv from "dotenv";
import express from "express";
import expressJSDocSwagger from "express-jsdoc-swagger";
import helmet from "helmet";

import router from "./router";
import { swaggerOptions } from "./swaggerOptions";
import * as logger from "./utils/logger";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

expressJSDocSwagger(app)(swaggerOptions);

app.use(helmet({}));

app.use("/", router);

// todo: @cron to run every 12 hours to pull a feed from https://openphish.com/phishing_feeds.html
// todo: build domain confirmation system
// todo: scope for url and domain (both are different!)
// todo: add regex to domain ( ^(?!http:\/\/|https:\/\/)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$ )
// todo: implement token refresh system
// todo: use puppeteer to check if a domain is a phishing site
// todo: log useragent and x-identity for each request
// todo: speed things up by returning last cached result if the domain is already scanned (still run scans after)

/* todo: list for implements:
- https://phish.report/
- https://phish.observer/
- https://phish.report/api/v0#tag/Takedown/paths/~1api~1v0~1cases/get
- https://urlhaus-api.abuse.ch/
- https://openphish.com/
- https://report.netcraft.com/api/v3#tag/Report/paths/~1report~1mistake/post
- https://any.run/api-documentation/
*/

// console.log(new Date().getTime());

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

import * as dotenv from "dotenv";
import express, { json, urlencoded } from "express";
import expressJSDocSwagger from "express-jsdoc-swagger";
import helmet from "helmet";

import { logRequest } from "./middlewear/logRequest";
import router from "./router";
import { swaggerOptions } from "./swaggerOptions";
import * as logger from "./utils/logger";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

expressJSDocSwagger(app)(swaggerOptions);

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(helmet({}));
app.use(logRequest);

app.use("/", router);

// todo: @cron to run every 12 hours to pull a feed from https://openphish.com/phishing_feeds.html
// todo: implement urlscan - https://urlscan.io/docs/api/#integrations w/ verdicts (see temp js script)
// todo: build domain confirmation system
// todo: scope for url and domain (both are different!)
// todo: add regex to domain ( ^(?!http:\/\/|https:\/\/)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$ )
// todo: implement token refresh system

/* todo: list for implements

- https://securitytrails.com/
- https://phish.report/
- https://phish.observer/
- https://phish.report/api/v0#tag/Takedown/paths/~1api~1v0~1cases/get
- https://urlhaus-api.abuse.ch/
*/

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

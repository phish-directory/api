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
// todo: implement urlhaus - https://urlhaus-api.abuse.ch/
// todo: implement urlscan - https://urlscan.io/docs/api/#integrations w/ verdicts (see temp js script)

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

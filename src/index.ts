import * as dotenv from "dotenv";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import expressJSDocSwagger from "express-jsdoc-swagger";

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

logger.database("Initializing database connection");
try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const db = drizzle(process.env.DATABASE_URL);
  logger.database("Database connection initialized successfully");
} catch (error) {
  logger.error(
    `Failed to initialize database connection: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}

app.disable("x-powered-by");
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

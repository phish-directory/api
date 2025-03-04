import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
// import { cron } from "@elysiajs/cron";
// bun add @elysiajs/jwt
// import { randomUUIDv7 } from "bun";
import { ip } from "elysia-ip";

import { getVersion } from "./utils/getVersion";
// import { prisma } from "./utils/prisma";
import * as logger from "./utils/logger";

let version = getVersion();

const port: number = Number(process.env.PORT) || 3000;

new Elysia()
  .use(
    cors({
      maxAge: 86400,
    })
  )
  .use(ip())
  // .use(
  //   cron({
  //     name: "updateState",
  //     pattern: "*/10 * * * * *",
  //     run() {

  //     },
  //   })
  // )
  .use(
    swagger({
      exclude: ["/"],
      documentation: {
        info: {
          title: "phish.directory API",
          version: version,
          description:
            "API for phish.directory, a community-driven anti-phishing tool. Helping catch, prevent, and catalog phishing links & attempts",
          contact: {
            name: "phish.directory",
            url: "mailto:team@phish.directory",
            email: "team@phish.directory",
          },
          // license: {
          //   name: "AGPL 3.0",
          //   url: "",
          // },
        },
        tags: [
          { name: "Domain", description: "Domain-related operations" },
          { name: "Email", description: "Email-related operations" },
          { name: "User", description: "User management operations" },
          { name: "Admin", description: "[RESTRICTED] Admin operations" },
        ],
        components: {
          securitySchemes: {
            BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [
          {
            BearerAuth: [],
          },
        ],
      },
      // Scalar-specific configuration
      provider: "scalar",
      scalarConfig: {
        hideDownloadButton: false,
        hideTestRequestButton: false,
        servers: [
          {
            url: "https://api.phish.directory",
            description: "Production server",
          },
          {
            url: "http://localhost:3000",
            description: "Local server",
          },
        ],
        forceDarkModeState: "dark",
        hideDarkModeToggle: true,
        // defaultOpenAllTags: true,
        metaData: {
          title: "phish.directory API",
          description:
            "API for phish.directory, a community-driven anti-phishing tool. Helping catch, prevent, and catalog phishing links & attempts",
          ogDescription:
            "API for phish.directory, a community-driven anti-phishing tool. Helping catch, prevent, and catalog phishing links & attempts",
          ogTitle: "phish.directory API",
        },
      },
      path: "/docs",
    })
  )
  .get("/", async ({ set }) => {
    // redirect to docs
    set.status = 302;
    set.headers = {
      Location: "/docs",
    };
    return "Redirecting to /docs";
  })
  .get("/up", async ({}) => {
    return {
      status: "up",
    };
  })
  .listen(port);

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

logger.log(`Server started on port ${port}`, "ready");
logger.log("Press Ctrl+C to stop the server", "ready");
logger.log("----\n", "plain");

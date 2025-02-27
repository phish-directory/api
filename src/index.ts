import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { prisma } from "../OLD-SRC/prisma";
import { getVersion } from "../OLD-SRC/utils/getVersion";

let version = getVersion();

new Elysia()
  .use(
    swagger({
      // Basic Swagger configuration
      documentation: {
        info: {
          title: "phish.directory API",
          version: version,
          description:
            "API for phish.directory, a community-driven anti-phishing tool. Helping catch, prevent, and catalog phishing links & attempts",
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
        hideDownloadButton: true,
        hideTestRequestButton: true,
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
    // Record start time for ping calculation
    const startTime = Date.now();

    // Check database connectivity with a simple query

    await prisma.$queryRaw`SELECT 1`;
    // Calculate ping time
    const pingTime = Date.now() - startTime;
    // Return success response with database status
  })
  .listen(3000);

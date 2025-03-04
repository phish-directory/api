import { getVersion } from "./func/getVersion";

let filePattern;
if (process.env.NODE_ENV === "production") {
  filePattern = ["./router.js", "./routes/*.js"];
} else {
  filePattern = ["./router.{ts,js}", "./routes/*.{ts,js}"];
}

let version = getVersion();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         code:
 *           type: integer
 *           description: Error code
 *
 * security:
 *   - BearerAuth: []
 */

export const swaggerOptions = {
  openapi: "3.0.0",
  info: {
    title: "phish.directory API",
    version: `${version}`,
    description:
      "API for phish.directory, a community-driven anti-phishing tool. Helping catch, prevent, and catalog phishing links & attempts",
    contact: {
      name: "phish.directory",
      url: "phish.directory",
      email: "team@phish.directory",
    },
  },
  servers: [
    {
      url: "https://api.phish.directory",
      description: "Production server",
    },
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  tags: [
    { name: "Domain", description: "Domain-related operations" },
    { name: "Email", description: "Email-related operations" },
    { name: "User", description: "User management operations" },
  ],
  filesPattern: filePattern,
  baseDir: __dirname,
  exposeSwaggerUI: true,
  exposeApiDocs: true,
  swaggerUIPath: "/docs",
  apiDocsPath: "/api-docs",
  definition: {
    openapi: "3.0.0",
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
};

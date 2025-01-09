import { describe } from "node:test";
import { getVersion } from "../../functions/getVersion";
import {
  AccountType,
  Permissions,
  Classifications,
  Verdict,
  APIs,
} from "../../types/enums";

let filePattern;
if (process.env.NODE_ENV === "production") {
  filePattern = ["./admin.js", "./routes/*.js"];
} else {
  filePattern = ["./router.{ts,js}", "./routes/*.{ts,js}"];
}
let version = getVersion();

/**
 * Swagger Options for Admin API documentation
 */
export const swaggerOptions = {
  openapi: "3.0.0",
  info: {
    title: "phish.directory Admin API",
    version: `${version}`,
    description:
      "Administrative API endpoints for phish.directory. These endpoints require admin-level access and provide advanced functionality for managing users, domains, and system configuration.",
    contact: {
      name: "phish.directory Admin Support",
      url: "phish.directory",
      email: "admin@phish.directory",
    },
  },
  servers: [
    {
      url: "https://api.phish.directory/admin",
      description: "Production Admin API",
    },
    {
      url: "http://localhost:3000/admin",
      description: "Development Admin API",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      AccountType: {
        type: "string",
        enum: Object.keys(AccountType).filter((key) => isNaN(Number(key))),
        description: "Types of user accounts in the system",
      },
      Permissions: {
        type: "string",
        enum: Object.keys(Permissions).filter((key) => isNaN(Number(key))),
        description: "User permission levels",
      },
      Classifications: {
        type: "string",
        enum: Object.keys(Classifications).filter((key) => isNaN(Number(key))),
        description: "Types of phishing/scam classifications",
      },
      Verdict: {
        type: "string",
        enum: Object.keys(Verdict).filter((key) => isNaN(Number(key))),
        description: "Final verdict classifications for domains",
      },
      APIs: {
        type: "string",
        enum: Object.keys(APIs).filter((key) => isNaN(Number(key))),
        description: "Available security and threat detection APIs",
      },
    },
  },
  security: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
    },
  },
  tags: [
    {
      name: "Users",
      description: "User management operations",
    },
    {
      name: "Domains",
      description: "Domain management and classification",
    },
    {
      name: "Reports",
      description: "Domain report management and review",
    },
    {
      name: "System",
      description: "System configuration and monitoring",
    },
  ],
  filesPattern: filePattern,
  basePath: "/admin",
  exposeSwaggerUI: true,
  swaggerUIPath: "/admin/docs",
  exposeApiDocs: true,
  apiDocsPath: "/admin/api-docs",
  baseDir: __dirname,
  swaggerUiOptions: {
    persistAuthorization: true,
  },
};

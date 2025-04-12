import { getVersion } from "src/func/getVersion";

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

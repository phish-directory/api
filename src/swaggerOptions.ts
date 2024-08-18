import { getVersion } from "./functions/getVersion";

let filePattern;

if (process.env.NODE_ENV === "production") {
  filePattern = ["./router.js", "./routes/*.js"];
} else {
  filePattern = ["./router.{ts,js}", "./routes/*.{ts,js}"];
}

let version = getVersion();

/**
 * Swagger Options, used to configure the swagger-ui-express package
 */
export const swaggerOptions = {
  openapi: "3.0.0",
  info: {
    title: "phish.directory API",
    version: `${version}`,
    description:
      "API for phish.directory, a community-driven anti-phishing tool. Helping catch, prevent, and catalog phishing links & attempts",
    termsOfService: "",
    contact: {
      name: "phish.directory",
      url: "phish.directory",
      email: "team@phish.directory",
    },
  },
  basePath: "/",
  tags: [],
  securityDefinitions: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
    },
  },
  security: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
    },
  },
  swaggerUiOptions: {},
  filesPattern: filePattern, // Glob pattern to find your jsdoc files
  exposeSwaggerUI: true,
  swaggerUIPath: "/docs", // SwaggerUI will be render in this url.
  exposeApiDocs: true,
  apiDocsPath: "/api-docs",
  baseDir: __dirname,
};

/**
 * Swagger Options, used to configure the swagger-ui-express package
 */
export const swaggerOptions = {
  openapi: "3.0.0",
  info: {
    title: "phish.directory API",
    version: `${process.env.npm_package_version!}`,
    description:
      "insert description here | in development | not for production use",
    termsOfService: "",
    contact: {
      name: "phish.directory",
      url: "phish.directory",
      email: "team@phish.directory",
    },
  },
  basePath: "/",
  tags: [
    { name: "Main API Endpoints", description: "Main API Endpoints" },
    {
      name: "Authentication Endpoints",
      description: "Authentication Endpoints",
    },
  ],
  /* security: {
    BasicAuth: {
      type: "http",
      scheme: "basic",
    },
  }, */
  // filesPattern: ["../routes/*.ts", "../database/models/*.schema.ts"], // Glob pattern to find your jsdoc files
  filesPattern: ["../routes/*.ts", "./router.ts"], // Glob pattern to find your jsdoc files
  swaggerUIPath: "/docs", // SwaggerUI will be render in this url.
  baseDir: __dirname,
  // disable the default tag
  defaultTag: false,
};

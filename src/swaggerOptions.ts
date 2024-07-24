let filePattern;

if (process.env.NODE_ENV === "production") {
  filePattern = ["./router.js", "./routes/*.js"];
} else {
  filePattern = ["./router.ts", "./routes/*.ts"];
}

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
  tags: [],
  securityDefinitions: {
    auth: {
      type: "apiKey",
      scheme: "Authorization",
    },
  },
  security: {
    auth: {
      type: "apiKey",
      scheme: "Authorization",
    },
  },
  swaggerUiOptions: {
    swaggerOptions: {
      // This one removes the modals spec
      // You can checkout more config info here: https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md
      defaultModelsExpandDepth: -1,
    },
  },
  // filesPattern: ["../routes/*.ts", "../database/models/*.schema.ts"], // Glob pattern to find your jsdoc files
  filesPattern: filePattern, // Glob pattern to find your jsdoc files
  swaggerUIPath: "/docs", // SwaggerUI will be render in this url.
  baseDir: __dirname,
  // disable the default tag
  defaultTag: false,
};

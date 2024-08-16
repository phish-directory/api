let filePattern;

if (process.env.NODE_ENV === "production") {
  filePattern = ["./router.js", "./routes/*.js"];
} else {
  filePattern = ["./router.{ts,js}", "./routes/*.{ts,js}"];
}

/**
 * Swagger Options, used to configure the swagger-ui-express package
 */
export const swaggerOptions = {
  openapi: "3.0.0",
  info: {
    title: "phish.directory API",
    version: `1.0.0`,
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
};

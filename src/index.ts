import express, { json, urlencoded } from "express";
// import expressJSDocSwagger from "express-jsdoc-swagger";
import * as dotenv from "dotenv";
import helmet from "helmet";

// import { swaggerOptions } from "./config/swaggerOptions";
import router from "./router";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

// expressJSDocSwagger(app)(swaggerOptions);

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(helmet({}));

app.use("/", router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

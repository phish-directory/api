import * as express from "express";

import { logRequest } from "../middleware/logRequest";
import adblockRouter from "./domain/adblock";
import checkRouter from "./domain/check";
import classifyRouter from "./domain/classify";
import reportRouter from "./domain/report";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

router.use("/check", checkRouter);
router.use("/classify", classifyRouter);
router.use("/report", reportRouter);
router.use("/adblock", adblockRouter);

export default router;

import * as express from "express";

import { logRequest } from "src/middleware/logRequest";
import adblockRouter from "./domain/adblock";
import checkRouter from "./domain/check";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

router.use("/check", checkRouter);
router.use("/adblock", adblockRouter);

export default router;

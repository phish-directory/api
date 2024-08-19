import * as express from "express";

import { logRequest } from "../middleware/logRequest";
import { ipQualityScoreService } from "../services/_index";
import { prisma } from "../prisma";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

router.get("/check/:email", async (req, res) => {
  const email = req.params.email;

  if (!email) {
    return res.status(400).json({ message: "No email provided." });
  }

  // validate email with regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email provided." });
  }

  const result = await ipQualityScoreService.email.check(email);
  res.status(200).json(result);
});

export default router;
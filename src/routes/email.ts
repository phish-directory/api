import * as express from "express";
import { logRequest } from "../middleware/logRequest";
import { ipQualityScoreService } from "../services/_index";
import { prisma } from "../prisma";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

/**
 * GET /email/check/:email
 * @summary Check email address reputation and validity
 * @description Asynchronously validates an email address and checks it against known malicious email databases.
 * Performs the following checks:
 * - Email format validation
 * - Domain validity
 * - Disposable email detection
 * - Fraud score assessment
 * - Recent abuse detection
 * @tags Email - Email validation and reputation checking
 * @param {string} email.path.required - Email address to check - eg: test@example.com
 * @return {object} 200 - Email check results
 * @return {object} 400 - Invalid email error
 * @produces application/json
 * @example response - 200 - Valid email response
 * {
 *   "valid": true,
 *   "disposable": false,
 *   "dns_valid": true,
 *   "fraud_score": 10,
 *   "recent_abuse": false,
 *   "suggested_domain": null,
 *   "first_seen": "2023-01-15",
 *   "success": true,
 *   "message": null
 * }
 * @example response - 400 - Invalid email error
 * {
 *   "message": "Invalid email provided."
 * }
 * @example response - 400 - Missing email error
 * {
 *   "message": "No email provided."
 * }
 */
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

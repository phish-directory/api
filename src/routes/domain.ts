import * as express from "express";
import * as jwt from "jsonwebtoken";

import { getDbDomain } from "../functions/db/getDbDomain";
import { domainCheck, domainReport } from "../functions/domain";
import { authenticateToken, getUserInfo } from "../functions/jwt";
import { parseData } from "../functions/parseData";
import { logRequest } from "../middleware/logRequest";
import { stripeMeter } from "../middleware/stripeMeter";
import { prisma } from "../prisma";
import { Classifications } from "../types/enums";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(logRequest);

/**
 * GET /domain/check
 * @summary Check domain reputation and phishing status
 * @description Performs comprehensive security checks on a domain across multiple services:
 * - Walshy's API
 * - IPQualityScore
 * - Google Safebrowsing
 * - Sinking Yahts
 * - PhishTank
 * - OpenPhish
 * - VirusTotal
 * - Phisherman
 * - PhishObserver
 * - URLScan
 * - SecurityTrails
 * - PhishReport
 *
 * Results are cached in our database for faster subsequent checks.
 * @tags Domain - Domain reputation and security endpoints
 * @security BearerAuth
 * @param {string} domain.query.required - Domain to check (top-level only, e.g., example.com)
 * @return {object} 200 - Domain check results
 * @return {string} 400 - Validation error
 * @return {string} 401 - Authentication error
 * @produces application/json
 * @example request - Example query
 * GET /domain/check?domain=example.com
 * @example response - 200 - Clean domain response
 * {
 *   "domain": "example.com",
 *   "phishing": false,
 *   "times": {
 *     "createdAt": "2024-01-09T12:00:00.000Z",
 *     "updatedAt": "2024-01-09T12:00:00.000Z",
 *     "lastChecked": "2024-01-09T12:00:00.000Z"
 *   }
 * }
 */
router.get("/check", authenticateToken, stripeMeter, async (req, res) => {
  // ... implementation
});

/**
 * Domain Classification
 * @typedef {object} DomainClassification
 * @property {string} domain.required - Domain to classify - eg: example.com
 * @property {Classifications} classification.required - Scam classification type - enum:Classifications
 */

/**
 * PUT /domain/classify
 * @summary Classify domain by threat type
 * @description Assigns a classification to a domain based on the type of threat it poses.
 * Requires TRUSTED or ADMIN permission level.
 *
 * Available classifications:
 * - postal: Shipping/postal service scams
 * - banking: Financial/banking fraud
 * - item_scams: Product/item-related scams
 * - other: Other malicious activities
 *
 * To request elevated access or suggest new classification types,
 * contact team@phish.directory
 * @tags Domain - Domain reputation and security endpoints
 * @security BearerAuth
 * @param {DomainClassification} request.body.required - Classification details
 * @return {string} 200 - Classification success
 * @return {string} 400 - Validation error
 * @return {string} 401 - Authentication error
 * @return {string} 403 - Insufficient permissions
 * @produces application/json
 * @example request - Classification request
 * {
 *   "domain": "suspicious-site.com",
 *   "classification": "banking"
 * }
 */
router.put("/classify", authenticateToken, stripeMeter, async (req, res) => {
  // ... implementation
});

/**
 * Domain Report
 * @typedef {object} DomainReport
 * @property {string} domain.required - Domain to report - eg: malicious-site.com
 * @property {string} notes - Additional context about the threat
 */

/**
 * POST /domain/report
 * @summary Report suspicious domain
 * @description Submit a domain for malicious activity review. Reports from trusted/admin users
 * are automatically approved and marked as malicious. Other reports require manual review.
 * @tags Domain - Domain reputation and security endpoints
 * @security BearerAuth
 * @param {DomainReport} request.body.required - Report details
 * @return {string} 200 - Report submission confirmation
 * @return {string} 400 - Validation error
 * @return {string} 401 - Authentication error
 * @produces application/json
 * @example request - Report submission
 * {
 *   "domain": "malicious-site.com",
 *   "notes": "Phishing campaign targeting banking customers"
 * }
 * @example response - 200 - Trusted user submission
 * "Domain reported and marked as malicious"
 * @example response - 200 - Regular user submission
 * "Domain report submitted for review"
 */
router.post("/report", authenticateToken, stripeMeter, async (req, res) => {
  // ... implementation
});

export default router;

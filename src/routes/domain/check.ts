import express from "express";
const router = express.Router();

import { findOrCreateDomain } from "../../utils/db/findOrCreateDomain";
import { prepareResponse } from "../../utils/domain/prepareResponse";
import { validateAndExtractParams } from "../../utils/domain/validateAndExtractDomainParams";
import { authenticateToken } from "../../utils/jwt";
import { ValidationError } from "../../utils/validationError";

/**
 * GET /domain/check
 * @summary Checks if a domain is phishing/malicious.
 * @description This endpoint checks if a domain is phishing/malicious.
 * It will return a boolean value of true if it is phishing/malicious and false if it is not, and some other data.
 * @tags Domain - Endpoints for checking / reporting domains.
 * @security BearerAuth
 * @param {string} domain.query.required - Domain to check
 * @param {boolean} extendData.query.optional - Optionally, request extra information about the domain (MAY HAVE LONGER RESPONSE TIME). You need special permissions to access this.
 * @return {object} 200 - Success message
 * @return {string} 400 - Error message
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Validate and extract query parameters
    const { domain, extendData } = await validateAndExtractParams(req);

    // Check if domain exists in database
    const dbDomain = await findOrCreateDomain(domain);

    // Prepare and send response
    const response = await prepareResponse(domain, dbDomain, extendData);

    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error.message);
    }
    console.error("Error in domain check:", error);
    return res.status(500).json("Internal server error");
  }
});

export default router;

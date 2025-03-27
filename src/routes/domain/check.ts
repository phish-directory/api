import express from "express";
const router = express.Router();

import { ValidationError } from "../../defs/validationError";
// import { findOrCreateDomain } from "../../func/db/findOrCreateDomain";
import { prepareResponse } from "../../func/domain/prepareResponse";
import { validateAndExtractParams } from "../../func/domain/validateAndExtractDomainParams";
import { authenticateToken } from "../../utils/jwt";
import { eq } from "drizzle-orm";
import { db } from "src/utils/db";
import { domains } from "src/db/schema";
import { checkAndUpdateDomainStatus } from "src/func/domain/checkAndUpdateDomainStatus";

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

    let dbDomain;

    // Check if domain exists in database
    dbDomain = await db.query.domains.findFirst({
      where: (domains) => eq(domains.domain, domain),
    });

    // if domain does not exist, create it
    if (!dbDomain) {
      dbDomain = await db.insert(domains).values({
        domain: domain,
        malicious: false,
        last_checked: new Date(),
      }).returning();
    }

    await checkAndUpdateDomainStatus(domain, dbDomain.id)

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

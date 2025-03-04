import { ValidationError } from "../../../src/defs/validationError";
import { userNeedsExtendedData } from "../userNeedsExtendedData";

/**
 * Validates the domain parameter and extracts query parameters
 * @param {Request} req - Express request object
 * @returns {Object} - Object containing validated domain and extendData flag
 * @throws {ValidationError} - If domain is missing or invalid
 */
export async function validateAndExtractParams(req) {
  const query = req.query;
  const domain = query.domain;
  const extendData = await userNeedsExtendedData(req);

  // Check if domain parameter exists
  if (!domain || domain === "" || domain === undefined || domain === null) {
    throw new ValidationError("No domain parameter found");
  }

  // Validate domain format
  const regex = new RegExp("^(?!http://|https://)[a-zA-Z0-9-]+.[a-zA-Z]{2,}$");
  if (!regex.test(domain)) {
    throw new ValidationError(
      "Invalid domain parameter, should be a top level domain. Ex: google.com, amazon.com"
    );
  }

  return { domain, extendData };
}

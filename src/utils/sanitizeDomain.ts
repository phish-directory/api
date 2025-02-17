// function that takes in a string and returns a sanitized version of it
//  * @param str - The string to be sanitized
//  * @returns sanitized string
//  */

// Domain validation constants
const MAX_DOMAIN_LENGTH = 253; // Maximum length of a domain name
const DOMAIN_REGEX = /^(?!:\/\/)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainValidationError";
  }
}
const validateDomain = (domain: string): boolean => {
  // Check domain length
  if (!domain || domain.length > MAX_DOMAIN_LENGTH) {
    throw new DomainValidationError(
      `Domain must be between 1 and ${MAX_DOMAIN_LENGTH} characters`
    );
  }

  // Check domain format using regex
  if (!DOMAIN_REGEX.test(domain)) {
    throw new DomainValidationError("Invalid domain format");
  }

  // Prevent any URL-like inputs
  if (
    domain.includes("http") ||
    domain.includes("://") ||
    domain.includes("/")
  ) {
    throw new DomainValidationError("Domain cannot contain URL components");
  }

  return true;
};

const sanitizeDomain = (domain: string): string => {
  // Convert to lowercase and trim whitespace
  return domain.toLowerCase().trim();
};

export { DomainValidationError, sanitizeDomain, validateDomain };

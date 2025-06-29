import { promises as dns } from 'dns';

const MAX_DOMAIN_LENGTH = 253; // Maximum length of a domain name
const DOMAIN_REGEX = /^(?!:\/\/)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainValidationError";
  }
}
const validateDomain = async (domain: string): Promise<boolean> => {
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

  // Perform DNS lookup to verify domain exists
  try {
    await dns.resolve(domain);
  } catch (error) {
    throw new DomainValidationError(`Domain does not resolve: ${domain}`);
  }

  return true;
};

const sanitizeDomain = (domain: string): string => {
  // Convert to lowercase and trim whitespace
  return domain.toLowerCase().trim();
};

export { DomainValidationError, sanitizeDomain, validateDomain };

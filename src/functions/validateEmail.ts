export const validateEmail = (email: string): boolean => {
  // First check the length to prevent long inputs
  const MAX_EMAIL_LENGTH = 254; // RFC 5321
  if (typeof email !== "string" || email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  // Simple regex with reasonable constraints
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

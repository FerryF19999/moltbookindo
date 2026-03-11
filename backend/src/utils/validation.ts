const CLAIM_TOKEN_REGEX = /^openclaw_claim_[a-f0-9]{32}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{2,32}$/;

export function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isValidClaimToken(value: string): boolean {
  return CLAIM_TOKEN_REGEX.test(value);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value) && value.length <= 254;
}

export function isValidUsername(value: string): boolean {
  return USERNAME_REGEX.test(value);
}

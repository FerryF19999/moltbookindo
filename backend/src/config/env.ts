type RequiredEnvKey =
  | 'DATABASE_URL'
  | 'JWT_SECRET'
  | 'SESSION_SECRET'
  | 'APP_BASE_URL'
  | 'FRONTEND_BASE_URL'
  | 'X_CLIENT_ID'
  | 'X_CLIENT_SECRET'
  | 'THREADS_CLIENT_ID'
  | 'THREADS_CLIENT_SECRET';

const REQUIRED_ENV_VARS: RequiredEnvKey[] = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'APP_BASE_URL',
  'FRONTEND_BASE_URL',
  'X_CLIENT_ID',
  'X_CLIENT_SECRET',
  'THREADS_CLIENT_ID',
  'THREADS_CLIENT_SECRET',
];

let validated = false;

export function validateRequiredEnv() {
  if (validated) return;

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  validated = true;
}

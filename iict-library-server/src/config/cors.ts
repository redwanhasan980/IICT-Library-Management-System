const STANDARD_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://iict-library.onrender.com',
];

const parseOrigins = (value?: string) =>
  String(value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const resolveAllowedCorsOrigins = (configuredOrigins = process.env.CORS_ORIGIN) =>
  Array.from(new Set([...STANDARD_CORS_ORIGINS, ...parseOrigins(configuredOrigins)]));

// Entries may use "*" as a wildcard for one or more characters, so a single
// CORS_ORIGIN entry like https://*.vercel.app can cover preview deployments.
const matchesOrigin = (origin: string, allowedOrigin: string) => {
  if (!allowedOrigin.includes('*')) {
    return origin === allowedOrigin;
  }

  const pattern = allowedOrigin
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^.]*');

  return new RegExp(`^${pattern}$`).test(origin);
};

export const isCorsOriginAllowed = (
  origin: string | undefined,
  allowedOrigins = resolveAllowedCorsOrigins(),
) => !origin || allowedOrigins.some((allowedOrigin) => matchesOrigin(origin, allowedOrigin));

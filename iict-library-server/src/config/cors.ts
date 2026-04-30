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

export const isCorsOriginAllowed = (
  origin: string | undefined,
  allowedOrigins = resolveAllowedCorsOrigins(),
) => !origin || allowedOrigins.includes(origin);

import { describe, expect, it } from 'vitest';
import { isCorsOriginAllowed, resolveAllowedCorsOrigins } from './cors';

describe('cors config', () => {
  it('allows local and hosted Render client origins by default', () => {
    const origins = resolveAllowedCorsOrigins('');

    expect(origins).toContain('http://localhost:5173');
    expect(origins).toContain('http://127.0.0.1:5173');
    expect(origins).toContain('https://iict-library.onrender.com');
  });

  it('keeps hosted origin even when CORS_ORIGIN is set to localhost only', () => {
    const origins = resolveAllowedCorsOrigins('http://localhost:5173');

    expect(isCorsOriginAllowed('https://iict-library.onrender.com', origins)).toBe(true);
    expect(isCorsOriginAllowed('http://localhost:5173', origins)).toBe(true);
  });

  it('allows extra configured origins without allowing unrelated sites', () => {
    const origins = resolveAllowedCorsOrigins('https://library.example.edu');

    expect(isCorsOriginAllowed('https://library.example.edu', origins)).toBe(true);
    expect(isCorsOriginAllowed('https://unknown.example.com', origins)).toBe(false);
  });
});

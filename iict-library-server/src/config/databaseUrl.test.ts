import { afterEach, describe, expect, it } from 'vitest';
import { configureSelectedDatabaseUrl } from './databaseUrl';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('configureSelectedDatabaseUrl', () => {
  it('uses local database URL when ONLINE is false', () => {
    process.env.ONLINE = 'false';
    process.env.LOCAL_DATABASE_URL = 'mysql://local-user:pass@localhost:3306/iict_library';
    process.env.REMOTE_DATABASE_URL = 'mysql://remote-user:pass@example.com:3306/defaultdb';

    const result = configureSelectedDatabaseUrl();

    expect(result.mode).toBe('local');
    expect(process.env.DATABASE_URL).toBe('mysql://local-user:pass@localhost:3306/iict_library');
  });

  it('uses remote database URL when ONLINE is true', () => {
    process.env.ONLINE = 'true';
    process.env.LOCAL_DATABASE_URL = 'mysql://local-user:pass@localhost:3306/iict_library';
    process.env.REMOTE_DATABASE_URL = 'mysql://remote-user:pass@example.com:3306/defaultdb?ssl-mode=REQUIRED';

    const result = configureSelectedDatabaseUrl();

    expect(result.mode).toBe('remote');
    expect(process.env.DATABASE_URL).toBe('mysql://remote-user:pass@example.com:3306/defaultdb?sslaccept=strict');
  });

  it('keeps REMOTE_DATABASE compatibility when ONLINE is not set', () => {
    delete process.env.ONLINE;
    process.env.REMOTE_DATABASE = 'true';
    process.env.REMOTE_DATABASE_URL = 'mysql://remote-user:pass@example.com:3306/defaultdb';

    const result = configureSelectedDatabaseUrl();

    expect(result.mode).toBe('remote');
  });
});

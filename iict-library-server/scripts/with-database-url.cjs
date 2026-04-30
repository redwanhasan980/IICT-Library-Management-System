const { spawnSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isTruthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());

const normalizeDatabaseUrl = (value) => {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);
    const sslMode = url.searchParams.get('ssl-mode');

    if (sslMode && !url.searchParams.has('sslaccept')) {
      url.searchParams.delete('ssl-mode');
      if (sslMode.toUpperCase() === 'REQUIRED') {
        url.searchParams.set('sslaccept', 'strict');
      }
    }

    return url.toString();
  } catch {
    return value;
  }
};

const useRemote = isTruthy(process.env.REMOTE_DATABASE);
const selectedUrl = useRemote
  ? process.env.REMOTE_DATABASE_URL || process.env.DATABASE_URL
  : process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;

if (!selectedUrl) {
  console.error('[database] No database URL configured. Set LOCAL_DATABASE_URL, REMOTE_DATABASE_URL, or DATABASE_URL.');
  process.exit(1);
}

process.env.DATABASE_URL = normalizeDatabaseUrl(selectedUrl);

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('[database] Missing command to run.');
  process.exit(1);
}

console.log(`[database] Using ${useRemote ? 'remote' : 'local'} database`);

const result = spawnSync(command, args, {
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

process.exit(result.status ?? 1);

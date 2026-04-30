const isTruthy = (value: string | undefined) =>
  ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());

const normalizeDatabaseUrl = (value: string) => {
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

export const configureSelectedDatabaseUrl = () => {
  const useRemote = process.env.ONLINE === undefined
    ? isTruthy(process.env.REMOTE_DATABASE)
    : isTruthy(process.env.ONLINE);
  const selectedUrl = useRemote
    ? process.env.REMOTE_DATABASE_URL || process.env.DATABASE_URL
    : process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;

  if (selectedUrl) {
    process.env.DATABASE_URL = normalizeDatabaseUrl(selectedUrl);
  }

  return { mode: useRemote ? 'remote' : 'local', databaseUrl: process.env.DATABASE_URL };
};

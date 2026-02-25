function getRequiredEnv(name: 'DATABASE_URL'): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`[database] Missing required environment variable: ${name}`);
  }

  return value;
}

export function getDatabaseUrl(): string {
  const databaseUrl = getRequiredEnv('DATABASE_URL');

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('[database] DATABASE_URL must be a valid URL');
  }

  if (parsedUrl.protocol !== 'mysql:' && parsedUrl.protocol !== 'mariadb:') {
    throw new Error('[database] DATABASE_URL must use mysql:// or mariadb:// protocol');
  }

  return databaseUrl;
}

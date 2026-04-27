import { defineConfig } from 'prisma/config';
import { config } from '@dotenvx/dotenvx';
import path from 'path';


if (!process.env.DATABASE_URL) {
  config({
    path: path.join(process.cwd(), '../.env'),
    debug: true,
  });
}

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

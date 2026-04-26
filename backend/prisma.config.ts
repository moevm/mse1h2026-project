/**
 * @file prisma.config.ts
 * @description Конфигурация Prisma для проекта MSE.
 * Этот файл определяет настройки подключения к базе данных, пути к схемам и миграциям.
 * @author @KorzikAlex @DanilOtmakhov
 */
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
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from '../generated/prisma/client';
import { getDatabaseUrl } from './env';

const adapter = new PrismaMariaDb(getDatabaseUrl());

export const prisma = new PrismaClient({ adapter });

export * from '../generated/prisma/client';

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../database/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 10,
      acquireTimeout: 60000, // максимальное время ожидания свободного соединения из пула 60 сек
      idleTimeout: 600000, // время простоя соединения перед его закрытием 10 минут
      minimumIdle: 2, // минимальное количество "теплых" соединений в пуле (2 всегда готовых)
    });

    super({ adapter });
  }
}

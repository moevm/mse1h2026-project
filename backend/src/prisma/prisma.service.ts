import { PrismaClient } from '@/generated/prisma/client';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
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

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('MySQL подключение успешно');
    } catch (error) {
      this.logger.error('Ошибка БД:', error);
      throw error;
    }
  }
}

/**
 * @file main.ts
 * @author @KorzikAlex @nhitar @sawsurd
 * @description Точка входа в приложение. Здесь создается и запускается сервер.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * @function bootstrap
 * @description Создает и запускает сервер.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Создаем приложение на основе AppModule
  await app.listen(process.env.PORT ?? 3000); // Запускаем сервер на порту, указанном в переменных окружения, или на 3000 по умолчанию
}

// Запускаем функцию bootstrap,
// используя void для подавления предупреждений
// о неиспользуемом promise.
void bootstrap();

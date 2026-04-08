import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://127.0.0.1:80',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
      'http://localhost:8080',
    ],
  });

  const host = '127.0.0.1';
  const port = 3000;

  await app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
  });
}
bootstrap();

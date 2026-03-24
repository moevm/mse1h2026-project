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
      'http://127.0.0.1:5173',
      // Docker frontend url
      'http://127.0.0.1:8080',
      // Localhost frontend url
      'http://localhost:8080',
      // Docker nginx url
      'http://172.20.0.1:80',
      // Vite dev server
      'http://localhost:5173',
      // Vite preview server
      'http://localhost:4173',
    ],
  });

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();

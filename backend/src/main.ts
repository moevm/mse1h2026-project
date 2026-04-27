import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

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
      'http://localhost:8081',
      'http://localhost:80',
    ],
  });

  const port = 3000;

  await app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
bootstrap();

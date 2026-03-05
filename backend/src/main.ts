import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
  }));

  app.enableCors({
    origin: ['http://localhost:80'],
  });

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();

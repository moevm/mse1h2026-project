import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://127.0.0.1:80', 'http://127.0.0.1:5173'],
  });

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();

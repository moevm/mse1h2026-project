import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({origin: []});
  
  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();

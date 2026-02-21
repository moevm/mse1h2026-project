import { Module } from '@nestjs/common';
import { HelloWorldController } from './hello-world/hello-world.controller';

@Module({
  controllers: [HelloWorldController],
})
export class AppModule {}

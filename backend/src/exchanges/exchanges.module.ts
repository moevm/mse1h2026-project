import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';

import { ExchangesController } from './exchanges.controller';
import { ExchangesService } from './exchanges.service';

@Module({
  imports: [UsersModule],
  controllers: [ExchangesController],
  providers: [ExchangesService],
})
export class ExchangesModule {}

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PrismaModule
  ],
  controllers: [HealthController],
})
export class HealthModule {}

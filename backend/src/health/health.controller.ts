import { PrismaService } from '@/prisma/prisma.service';
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService
  ) {}

  @Get()
  @HealthCheck()
  checkConnection() {
    return this.health.check([
      () => this.http.pingCheck('app', 'http://127.0.0.1:3000/api/courses'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  checkPrisma() {
    return this.health.check([
      () => this.prisma.pingCheck('prisma', this.prismaService as any),
    ]);
  }
}
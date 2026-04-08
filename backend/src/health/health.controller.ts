import { SkipAuth } from '@/common/guards/auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @SkipAuth()
  @Get()
  @HealthCheck()
  checkConnection() {
    return this.health.check([
      () => this.http.pingCheck('app', 'http://127.0.0.1:3000/hello-world', { timeout: 3000 }),
      () => this.prisma.pingCheck('prisma', this.prismaService),
    ]);
  }
}

import { Controller, Get } from '@nestjs/common';

import { HelloWorldService } from './hello-world.service';
import { SkipAuth } from '@/common/guards/auth.guard';

@Controller()
export class HelloWorldController {
  constructor(private readonly helloWorldService: HelloWorldService) {}

  @SkipAuth()
  @Get('hello-world')
  getHello(): string {
    return this.helloWorldService.getHello();
  }
}

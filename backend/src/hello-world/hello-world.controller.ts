import { SkipAuth } from '@/common/guards/auth.guard';
import { Controller, Get } from '@nestjs/common';

import { HelloWorldService } from './hello-world.service';

@Controller()
export class HelloWorldController {
  constructor(private readonly helloWorldService: HelloWorldService) {}

  @SkipAuth()
  @Get('hello-world')
  getHello(): string {
    return this.helloWorldService.getHello();
  }
}

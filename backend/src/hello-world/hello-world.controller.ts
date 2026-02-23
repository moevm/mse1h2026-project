import { Controller, Get, Redirect } from '@nestjs/common';
import { HelloWorldService } from './hello-world.service';

@Controller()
export class HelloWorldController {
  constructor(private readonly helloWorldService: HelloWorldService) {}

  @Get()
  @Redirect('/hello-world', 302)
  redirect() {}

  @Get('hello-world')
  getHello(): string {
    return this.helloWorldService.getHello();
  }
}

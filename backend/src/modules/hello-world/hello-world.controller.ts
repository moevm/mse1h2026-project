import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class HelloWorldController {
  @Get()
  @Redirect('/hello-world', 302)
  redirect() {}

  @Get('hello-world')
  hello() {
    return '<h1> Hello world! </h1>';
  }
}

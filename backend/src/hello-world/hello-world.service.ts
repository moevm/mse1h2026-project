import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloWorldService {
  getHello(): string {
    return '<h1> Hello world! </h1>';
  }
}

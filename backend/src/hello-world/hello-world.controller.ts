import { Controller, Get, UseGuards } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { HelloWorldService } from './hello-world.service';

@Controller()
export class HelloWorldController {
  constructor(private readonly helloWorldService: HelloWorldService) {}

  @UseGuards(RolesGuard)
  // @Roles(['admin'])
  @Get('hello-world')
  getHello(): string {
    return this.helloWorldService.getHello();
  }
}

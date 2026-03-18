import { Controller, Get, UseGuards } from '@nestjs/common';
import { HelloWorldService } from './hello-world.service';
import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';

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

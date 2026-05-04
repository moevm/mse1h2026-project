import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Param, Post, Put, Req, UseGuards } from '@nestjs/common';

import { CreateRequestDto } from './dto/create-request.dto';
import { ExchangesService } from './exchanges.service';

@Controller('api/exchanges/requests')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @UseGuards(RolesGuard)
  @Roles(['student'])
  @Post()
  create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: Request & { user: { sub: string; email: string; role: string } },
  ) {
    return this.exchangesService.createRequest(createRequestDto, req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Put(':id')
  confirmRequest(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: string; email: string; role: string } },
  ) {
    return this.exchangesService.confirmRequest(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: string; email: string; role: string } },
  ) {
    return this.exchangesService.deleteRequest(id, req.user);
  }
}

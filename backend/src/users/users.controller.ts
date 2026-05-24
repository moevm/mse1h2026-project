import { BadRequestException, Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: string) {
    if (!role) {
      return this.usersService.getAllUsers();
    }

    if (role !== 'student' && role !== 'admin') {
      throw new BadRequestException('Role must be one of: student, admin');
    }

    return this.usersService.getUsersByRole(role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }
}

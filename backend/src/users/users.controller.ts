import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: string) {
    if (role && (role === 'user' || role === 'admin')) {
      return this.usersService.getUsersByRole(role);
    }
    return this.usersService.getAllUsers();
  }
}

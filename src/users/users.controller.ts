import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  async createuser(@Body() dto: CreateUserDto) {
    return await this.usersService.createuser(dto);
  }
  @Get()
  async getUsers() {
    return await this.usersService.getUsers();
  }
  @Get()
  async getoneUser(@Request() email: string) {
    return await this.usersService.findByEmail(email);
  }
}

// src/user/user.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: UserDto) {
    return this.userService.create(dto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UserDto>) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}

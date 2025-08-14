// src/workshop/workshop.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { workShopDto } from './dto/workshop.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('workshop')
export class WorkshopController {
  constructor(private readonly service: WorkshopService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: workShopDto, @Req() req) {
    const userId = req.user._id; 
    return this.service.create(dto, userId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: workShopDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

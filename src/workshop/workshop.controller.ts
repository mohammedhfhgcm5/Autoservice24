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
  Query,
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { workShopDto } from './dto/workshop.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { currentUser } from 'src/auth/decorator/current.user.decorator';

@Controller('workshop')
export class WorkshopController {
  constructor(private readonly service: WorkshopService) {}

  @UseGuards(JwtAuthGuard)
  @Post('createworkshop')
  create(@Body() dto: workShopDto, @currentUser() user) {
  
    const userId = user._id; 
    return this.service.create(dto, userId);
  }

  @Get('getallworkshop')
  findAll() {
    return this.service.findAll();
  }
  @Get('nearby-workshops')
    async getNearbyWorkshops(
      @Query('type') type: string, // نوع الخدمة (مثلاً oilchange)
      @Query('lng') lng: string, // خط الطول
      @Query('lat') lat: string, // خط العرض
      @Query('radius') radius?: string, // نصف قطر الدائرة (متر)
    ) {
      const lngNum = parseFloat(lng);
      const latNum = parseFloat(lat);
      const maxDistance = radius ? parseInt(radius) : 5000; // القيمة الافتراضية 5 كم
  
      return this.service.getNearbyWorkshopsByServiceType(
        type,
        lngNum,
        latNum,
        maxDistance,
      );
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

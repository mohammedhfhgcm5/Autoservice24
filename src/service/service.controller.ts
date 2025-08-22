import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceType } from './service.schema';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post('createservice')
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Get('findallservice')
  findAll(@Query('serviceType') serviceType?: ServiceType) {
    return this.serviceService.findAll(serviceType);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('serviceType') serviceType?: ServiceType,
  ) {
    return this.serviceService.search(query, serviceType);
  }

  @Get('types')
  getServiceTypes() {
    return this.serviceService.getServiceTypes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.serviceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}

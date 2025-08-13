import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SavedServiceService } from './saved-service.service';
import { CreateSavedServiceDto } from './dto/create-saved-service.dto';
import { UpdateSavedServiceDto } from './dto/update-saved-service.dto';

@Controller('saved-services')
export class SavedServiceController {
  constructor(private readonly savedServiceService: SavedServiceService) {}

  @Post()
  create(@Body() dto: CreateSavedServiceDto) {
    return this.savedServiceService.create(dto);
  }

  @Get()
  findAll() {
    return this.savedServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savedServiceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSavedServiceDto) {
    return this.savedServiceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savedServiceService.remove(id);
  }
}

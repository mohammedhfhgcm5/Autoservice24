import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceType } from './service.schema';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // ✅ Create service with optional image upload
  @Post('createservice')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/services',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\//)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateServiceDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files && files.length > 0) {
      dto.images = files.map((file) => `/uploads/services/${file.filename}`);
    }
    return this.serviceService.create(dto);
  }

   @Get()
  async getAll(
    @Query('serviceType') serviceType?: ServiceType,
    @Query('skip') skip = '0',
    @Query('limit') limit = '10',
  ) {
    const skipNum = parseInt(skip, 10);
    const limitNum = parseInt(limit, 10);

    return this.serviceService.findAll(serviceType, skipNum, limitNum);
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

  // ✅ Upload multiple images for an existing service
  @Post(':id/upload-images')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/services',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\//)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const imagePaths = files.map(
      (file) => `/uploads/services/${file.filename}`,
    );
    return this.serviceService.addImages(id, imagePaths);
  }

   @Get(':id/owner-phone')
  @HttpCode(HttpStatus.OK)
  async getOwnerPhone(@Param('id') id: string) {
    const result = await this.serviceService.getWorkshopOwnerPhoneByServiceId(id);
    return result;
  }
}

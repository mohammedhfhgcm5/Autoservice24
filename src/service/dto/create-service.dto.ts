import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ServiceType } from '../service.schema';

export class CreateServiceDto {
  @IsMongoId()
  @IsNotEmpty()
  workshop_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsOptional()
  images?: string[];

  @IsEnum(ServiceType)
  @IsNotEmpty()
  service_type: ServiceType;
}

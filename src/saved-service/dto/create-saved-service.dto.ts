import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSavedServiceDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsMongoId()
  @IsNotEmpty()
  service_id: string;

  @IsOptional()
  saved_at?: Date;
}

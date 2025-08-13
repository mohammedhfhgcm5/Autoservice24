import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateSavedServiceDto {
  @IsMongoId()
  @IsOptional()
  user_id?: string;

  @IsMongoId()
  @IsOptional()
  service_id?: string;

  @IsOptional()
  saved_at?: Date;
}

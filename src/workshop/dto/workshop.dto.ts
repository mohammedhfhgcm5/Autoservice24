import { IsDate, IsString } from "class-validator";


export class workShopDto {
  user_id: string;

  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsString()
  location_x: string;
  @IsString()
  location_y: string;
  @IsString()
  working_hours: string;
  @IsString()
  profile_image: String;
  @IsDate()
  created_at: Date;
}

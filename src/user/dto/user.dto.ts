import { IsDate, IsEmail, IsString } from "class-validator";

export class UserDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  username: string;
  @IsString()
  //owner or user
  user_type: string;
  @IsString()
  phone: string;
  @IsString()
  profile_image: string;

}


export class UserResponse {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  username: string;
  @IsString()
  //owner or user
  user_type: string;
  @IsString()
  phone: string;
  @IsString()
  profile_image?: string;
  @IsDate()
  created_at: Date;
}

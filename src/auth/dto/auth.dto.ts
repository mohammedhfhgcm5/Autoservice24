import { IsEmail, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class PayloadDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  _id: string;
  @IsString()
  username: string;
  @IsString()
  user_type: string;
}

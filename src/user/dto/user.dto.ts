import {  IsBoolean, IsEmail, IsIn, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsEmail()
  email?: string;
  @IsString()
  password?: string;
  @IsString()
  username: string;
  @IsString()
  @IsIn(['user', 'owner'])
  
  user_type: string;
  @IsString()
  phone?: string;
  @IsString()
  profile_image?: string;
 
    @IsString()
    @IsIn( ['local', 'google', 'facebook', 'apple'] )
    provider: string;
  
    @IsString() // مثال: sub من Google أو id من Facebook
    providerId?: string;



    @IsBoolean()
    verified?: boolean;

    @IsString()
    verificationToken?:string;

    
}



import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, EditUserDto, ForgotPasswordDto, PayloadDto } from './dto/auth.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


 

  @Post('signin') // Now: POST /auth/signin
  signin(@Body() authBody: AuthDto) {
    return this.authService.logIn(authBody);
  }

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads/users',
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
  async signup(
    @UploadedFile() file: Express.Multer.File,
    @Body() signupBody: UserDto,
  ) {
    // image path saved in DB
    const imagePath = file ? `/uploads/users/${file.filename}` : undefined;


    return this.authService.signUp({
      ...signupBody,
      profile_image: imagePath,
    });
  }


   @Get('verify-email')
   async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const result = await this.authService.verifyEmail(token);
      
      // Set content type to HTML and send the HTML content
      res.setHeader('Content-Type', 'text/html');
      res.send(result.message);
    } catch (error) {
      // Return error HTML page
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification Failed</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f7fa;">
          <div style="
            text-align: center;
            padding: 40px;
            background-color: #ffe6e6;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 50px auto;
          ">
            <h1 style="color: #d32f2f;">❌ Verification Failed</h1>
            <p style="color: #666; font-size: 16px;">Invalid or expired verification token</p>
          
          </div>
        </body>
        </html>
      `);
    }
  }



   @Post('sendforgotPassword')
  async sendforgotPassword(@Body('email') email: string) {
    return this.authService.sendforgotPassword(email);
  }

   @Post('verify-reset')
  async verifyReset(@Body() body: { email: string; code: string }) {
    return this.authService.verifyReset(body.email, body.code);
  }


 @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }



  @Put('edit/:id')
 @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads/users',
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
  editDetails(
    @Param('id') id: string,
    @Body() body: EditUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/users/${file.filename}` : undefined;
    return this.authService.editDetails(id, {
      ...body,
      profile_image: imagePath,
    });
  }

 
  @Post('google')
  async googleLogin(
    @Body() signUpbody: { idToken: string; usertype: string; provider: string },
  ) {
    const userData = await this.authService.verifyGoogleToken(
      signUpbody.idToken,
      signUpbody.usertype,
      signUpbody.provider,
    );
    const jwt = await this.authService.generateJwt(userData);
    return { token: jwt, user: userData };
  }

  @Post('social-login')
  async socialLogin(
    @Body() signUpbody: { Token: string; usertype: string; provider: string },
  ) {
    const { provider, Token, usertype } = signUpbody;

    let userInfo: PayloadDto;

    switch (provider) {
      case 'google':
        userInfo = await this.authService.verifyGoogleToken(
          Token,
          usertype,
          provider,
        );
        break;
      case 'facebook':
        userInfo = await this.authService.verifyFacebookToken(
          Token,
          usertype,
          provider,
        );
        break;
      case 'apple':
        userInfo = await this.authService.verifyAppleToken(
          Token,
          usertype,
          provider,
        );
        break;
      default:
        throw new BadRequestException('Unsupported provider');
    }

    const jwt = await this.authService.generateJwt(userInfo);
    return { token: jwt, user: userInfo };
  }



}

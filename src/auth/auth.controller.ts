import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, EditUserDto, ForgotPasswordDto, PayloadDto } from './dto/auth.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin') // Now: POST /auth/signin
  signin(@Body() authBody: AuthDto) {
    return this.authService.logIn(authBody);
  }

  @Post('signup')
  @UseInterceptors(
    FileInterceptor('image', {
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
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
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

    console.log('Uploaded file:', file); // check file info

    return this.authService.signUp({
      ...signupBody,
      profile_image: imagePath,
    });
  }

  @Put('edit/:id')
  @UseInterceptors(
    FilesInterceptor('image', 5, {
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
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
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

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
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

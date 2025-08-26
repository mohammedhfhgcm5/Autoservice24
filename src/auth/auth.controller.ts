import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, EditUserDto, ForgotPasswordDto, PayloadDto } from './dto/auth.dto';
import { UserDto } from 'src/user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin') // Now: POST /auth/signin
  signin(@Body() authBody: AuthDto) {
    return this.authService.logIn(authBody);
  }

  @Post('signup') // Now: POST /auth/signup
  signup(@Body() signupBody: UserDto) {
    return this.authService.signUp(signupBody);
  }

  @Put('edit/:id')
  editDetails(@Param('id') id: string, @Body() body: EditUserDto) {
    return this.authService.editDetails(id, body);
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

    let userInfo:PayloadDto;

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

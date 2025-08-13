import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
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
}

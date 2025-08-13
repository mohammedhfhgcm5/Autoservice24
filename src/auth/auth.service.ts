import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto, EditUserDto, ForgotPasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userservice: UserService,
    private jwtService: JwtService,
  ) {}

  async logIn(authBody: AuthDto) {
    const user = await this.userservice.getOneUserByEmail(authBody.email);

    if (!user || !bcrypt.compareSync(authBody.password, user.password)) {
      throw new UnauthorizedException();
    }

    const payload = {
      email: authBody.email,
      id: user.id,
      username: user.username,
      user_type: user.user_type,
    };

    return {
      token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async signUp(signupBody: UserDto) {
    const { password, ...rest } = signupBody;
    const salt = bcrypt.genSaltSync(16);
    const hashPassword = bcrypt.hashSync(password, salt);
    const newUser = await this.userservice.create({
      password: hashPassword,
      email: rest.email,
      username: rest.username,
      phone: rest.phone,
      profile_image: rest.profile_image,
      user_type: rest.user_type,
    });

    return {
      status: true,
      message: 'User created successfully',
      user: newUser,
    };
  }

  async editDetails(userId: string, body: EditUserDto) {
    const updatedUser = await this.userservice.update(userId, body);
    return {
      status: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userservice.getOneUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('User not found');

    const salt = bcrypt.genSaltSync(16);
    const newHashedPassword = bcrypt.hashSync(dto.newPassword, salt);

    await this.userservice.update(user.id, { password: newHashedPassword });

    return {
      status: true,
      message: 'Password updated successfully',
    };
  }
}




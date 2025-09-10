import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthDto,
  EditUserDto,
  ForgotPasswordDto,
  PayloadDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserDto } from 'src/user/dto/user.dto';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly userservice: UserService,
    private jwtService: JwtService,
  ) {}

  async logIn(authBody: AuthDto) {
    const user = await this.userservice.getOneUserByEmail(authBody.email);
    if (!user.password) {
      throw new UnauthorizedException();
    }

    // Use async bcrypt.compare instead of sync
    const isPasswordValid = await bcrypt.compare(
      authBody.password,
      user.password,
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = {
      email: authBody.email,
      _id: user._id,
      username: user.username,
      user_type: user.user_type,
      phone: user.phone,
      profile_image: user.profile_image,
    };

    return {
      token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async signUp(signupBody: UserDto) {
    if (!signupBody.password) {
      throw new UnauthorizedException();
    }
    const { password, ...rest } = signupBody;

    // Reduced salt rounds from 16 to 10 for better performance
    // Use async operations instead of sync
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await this.userservice.create({
      password: hashPassword,
      email: rest.email,
      username: rest.username,
      phone: rest.phone,
      profile_image: rest.profile_image,
      user_type: rest.user_type,
      provider: 'local',
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

    // Use async bcrypt operations with reduced salt rounds
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.userservice.update(user.id, { password: newHashedPassword });

    return {
      status: true,
      message: 'Password updated successfully',
    };
  }

  // Add timeout and better error handling for external API calls
  async verifyGoogleToken(idToken: string, userType: string, provider: string) {
    try {
      const res = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
        { timeout: 5000 }, // 5 second timeout
      );

      if (!res.data || !res.data.email) throw new UnauthorizedException();

      const user = await this.userservice.findByProvider(
        provider,
        res.data.sub || res.data.id,
      );

      if (user) {
        return this.buildPayload(user);
      } else {
        const newuser = await this.userservice.create({
          email: res.data.email,
          username: res.data.name,
          profile_image: res.data.picture,
          user_type: userType,
          provider: provider,
          providerId: res.data.sub,
        });

        return this.buildPayload(newuser);
      }
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }

  async verifyFacebookToken(
    accessToken: string,
    userType: string,
    provider: string,
  ) {
    try {
      const res = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
        { timeout: 5000 }, // 5 second timeout
      );

      if (!res.data || !res.data.email) throw new UnauthorizedException();

      const user = await this.userservice.findByProvider(
        provider,
        res.data.sub || res.data.id,
      );

      if (user) {
        return this.buildPayload(user);
      } else {
        const newuser = await this.userservice.create({
          email: res.data.email,
          username: res.data.name,
          profile_image: res.data.picture?.data?.url,
          user_type: userType,
          provider: provider,
        });

        return this.buildPayload(newuser);
      }
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Facebook token');
    }
  }

  async verifyAppleToken(
    identityToken: string,
    userType: string,
    provider: string,
  ) {
    try {
      const decoded: any = jwt.decode(identityToken);

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      const user = await this.userservice.findByProvider(provider, decoded.sub);

      if (user) {
        return this.buildPayload(user);
      } else {
        const newUser = await this.userservice.create({
          provider: provider,
          providerId: decoded.sub,
          username: 'Apple User ' + Math.floor(Math.random() * 10000),
          user_type: userType,
        });

        return this.buildPayload(newUser);
      }
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Apple token');
    }
  }

  private buildPayload(user: any) {
    return {
      email: user.email,
      _id: user._id,
      username: user.username,
      user_type: user.user_type,
      phone: user.phone,
      profile_image: user.profile_image,
    };
  }

  async generateJwt(userpayload: PayloadDto) {
    return this.jwtService.sign(userpayload);
  }
}

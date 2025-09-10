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
    console.log('🕐 Starting login process...');
    const startTime = Date.now();

    try {
      // Time database query
      console.time('📊 Database Query');
      const user = await this.userservice.getOneUserByEmail(authBody.email);
      console.timeEnd('📊 Database Query');

      if (!user) {
        console.log('❌ User not found');
        throw new UnauthorizedException();
      }

      if (!user.password) {
        console.log('❌ User has no password');
        throw new UnauthorizedException();
      }

      // Time password comparison
      console.time('🔐 Password Compare');
      const isPasswordValid = await bcrypt.compare(
        authBody.password,
        user.password,
      );
      console.timeEnd('🔐 Password Compare');

      if (!isPasswordValid) {
        console.log('❌ Invalid password');
        throw new UnauthorizedException();
      }

      // Time JWT signing
      console.time('🎫 JWT Signing');
      const payload = {
        email: authBody.email,
        _id: user._id,
        username: user.username,
        user_type: user.user_type,
        phone: user.phone,
        profile_image: user.profile_image,
      };

      const token = this.jwtService.sign(payload);
      console.timeEnd('🎫 JWT Signing');

      const totalTime = Date.now() - startTime;
      console.log(`✅ Login completed in ${totalTime}ms`);

      return {
        token,
        user: payload,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.log(`❌ Login failed in ${totalTime}ms`);
      throw error;
    }
  }

  async signUp(signupBody: UserDto) {
    console.log('🕐 Starting signup process...');
    const startTime = Date.now();

    try {
      if (!signupBody.password) {
        throw new UnauthorizedException();
      }

      const { password, ...rest } = signupBody;

      // Time password hashing
      console.time('🔐 Password Hashing');
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      console.timeEnd('🔐 Password Hashing');

      // Time user creation
      console.time('📊 User Creation');
      const newUser = await this.userservice.create({
        password: hashPassword,
        email: rest.email,
        username: rest.username,
        phone: rest.phone,
        profile_image: rest.profile_image,
        user_type: rest.user_type,
        provider: 'local',
      });
      console.timeEnd('📊 User Creation');

      const totalTime = Date.now() - startTime;
      console.log(`✅ Signup completed in ${totalTime}ms`);

      return {
        status: true,
        message: 'User created successfully',
        user: newUser,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.log(`❌ Signup failed in ${totalTime}ms`);
      throw error;
    }
  }

  async editDetails(userId: string, body: EditUserDto) {
    console.log('🕐 Starting edit details process...');
    const startTime = Date.now();

    try {
      console.time('📊 User Update');
      const updatedUser = await this.userservice.update(userId, body);
      console.timeEnd('📊 User Update');

      const totalTime = Date.now() - startTime;
      console.log(`✅ Edit details completed in ${totalTime}ms`);

      return {
        status: true,
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.log(`❌ Edit details failed in ${totalTime}ms`);
      throw error;
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    console.log('🕐 Starting forgot password process...');
    const startTime = Date.now();

    try {
      console.time('📊 Find User');
      const user = await this.userservice.getOneUserByEmail(dto.email);
      console.timeEnd('📊 Find User');

      if (!user) throw new UnauthorizedException('User not found');

      console.time('🔐 Password Hashing');
      const salt = await bcrypt.genSalt(10);
      const newHashedPassword = await bcrypt.hash(dto.newPassword, salt);
      console.timeEnd('🔐 Password Hashing');

      console.time('📊 Update Password');
      await this.userservice.update(user.id, { password: newHashedPassword });
      console.timeEnd('📊 Update Password');

      const totalTime = Date.now() - startTime;
      console.log(`✅ Forgot password completed in ${totalTime}ms`);

      return {
        status: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.log(`❌ Forgot password failed in ${totalTime}ms`);
      throw error;
    }
  }

  async verifyGoogleToken(idToken: string, userType: string, provider: string) {
    console.log('🕐 Starting Google token verification...');
    const startTime = Date.now();

    try {
      console.time('🌐 Google API Call');
      const res = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
        { timeout: 5000 },
      );
      console.timeEnd('🌐 Google API Call');

      if (!res.data || !res.data.email) throw new UnauthorizedException();

      console.time('📊 Find User by Provider');
      const user = await this.userservice.findByProvider(
        provider,
        res.data.sub || res.data.id,
      );
      console.timeEnd('📊 Find User by Provider');

      if (user) {
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ Google verification (existing user) completed in ${totalTime}ms`,
        );
        return this.buildPayload(user);
      } else {
        console.time('📊 Create New User');
        const newuser = await this.userservice.create({
          email: res.data.email,
          username: res.data.name,
          profile_image: res.data.picture,
          user_type: userType,
          provider: provider,
          providerId: res.data.sub,
        });
        console.timeEnd('📊 Create New User');

        const totalTime = Date.now() - startTime;
        console.log(
          `✅ Google verification (new user) completed in ${totalTime}ms`,
        );
        return this.buildPayload(newuser);
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.log(`❌ Google verification failed in ${totalTime}ms`);
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }

  async verifyFacebookToken(
    accessToken: string,
    userType: string,
    provider: string,
  ) {
    console.log('🕐 Starting Facebook token verification...');
    const startTime = Date.now();

    try {
      console.time('🌐 Facebook API Call');
      const res = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
        { timeout: 5000 },
      );
      console.timeEnd('🌐 Facebook API Call');

      if (!res.data || !res.data.email) throw new UnauthorizedException();

      console.time('📊 Find User by Provider');
      const user = await this.userservice.findByProvider(
        provider,
        res.data.sub || res.data.id,
      );
      console.timeEnd('📊 Find User by Provider');

      if (user) {
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ Facebook verification (existing user) completed in ${totalTime}ms`,
        );
        return this.buildPayload(user);
      } else {
        console.time('📊 Create New User');
        const newuser = await this.userservice.create({
          email: res.data.email,
          username: res.data.name,
          profile_image: res.data.picture?.data?.url,
          user_type: userType,
          provider: provider,
        });
        console.timeEnd('📊 Create New User');

        const totalTime = Date.now() - startTime;
        console.log(
          `✅ Facebook verification (new user) completed in ${totalTime}ms`,
        );
        return this.buildPayload(newuser);
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.log(`❌ Facebook verification failed in ${totalTime}ms`);
      throw new UnauthorizedException('Failed to verify Facebook token');
    }
  }

  async verifyAppleToken(
    identityToken: string,
    userType: string,
    provider: string,
  ) {
    console.log('🕐 Starting Apple token verification...');
    const startTime = Date.now();

    try {
      console.time('🔐 JWT Decode');
      const decoded: any = jwt.decode(identityToken);
      console.timeEnd('🔐 JWT Decode');

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      console.time('📊 Find User by Provider');
      const user = await this.userservice.findByProvider(provider, decoded.sub);
      console.timeEnd('📊 Find User by Provider');

      if (user) {
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ Apple verification (existing user) completed in ${totalTime}ms`,
        );
        return this.buildPayload(user);
      } else {
        console.time('📊 Create New User');
        const newUser = await this.userservice.create({
          provider: provider,
          providerId: decoded.sub,
          username: 'Apple User ' + Math.floor(Math.random() * 10000),
          user_type: userType,
        });
        console.timeEnd('📊 Create New User');

        const totalTime = Date.now() - startTime;
        console.log(
          `✅ Apple verification (new user) completed in ${totalTime}ms`,
        );
        return this.buildPayload(newUser);
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.log(`❌ Apple verification failed in ${totalTime}ms`);
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
    console.time('🎫 Generate JWT');
    const token = this.jwtService.sign(userpayload);
    console.timeEnd('🎫 Generate JWT');
    return token;
  }
}

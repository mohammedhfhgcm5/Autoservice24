import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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
import * as nodemailer from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { PasswordReset } from './schema/PasswordReset.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {


  private transporter;
  constructor(
    private readonly userservice: UserService,
    private jwtService: JwtService,
     @InjectModel(PasswordReset.name) private resetModel: Model<PasswordReset>,
  ) {


     // تهيئة الإيميل مباشرة هنا
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // ⚠️ لازم App Password
      },
    });
  }



  async logIn(authBody: AuthDto) {
    const user = await this.userservice.getOneUserByEmail(authBody.email);
    if (!user.password) {
      throw new UnauthorizedException();
    }
    if (!user.verified) {
  throw new UnauthorizedException('Please verify your email before logging in');
}

    if ( !bcrypt.compareSync(authBody.password, user.password!)) {
      throw new UnauthorizedException();
    }

    const payload = {
      email: authBody.email,
      _id: user._id,
      username: user.username,
      user_type: user.user_type,
      phone: user.phone, // أضف هذا السطر ✅
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
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = bcrypt.hashSync(password, salt);
    const newUser = await this.userservice.create({
      password: hashPassword,
     ...rest,
      provider: 'local',
      verified:false

    });

     const verificationToken = this.jwtService.sign(
    { email: rest.email },
    {
      secret: process.env.JWT_VERIFICATION_SECRET,
      expiresIn: '1d',
    },
  );


     await this.sendVerificationEmail(rest.email!, verificationToken);

    return {
      status: true,
      message: 'User created successfully',
      user: newUser,
    };
  }



  //send email varifay 
  private async sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  this.transporter.sendMail({
  from: `"Auto Service 24" <no-reply@autoservice24.com>`,
  to: email,
  subject: 'Verify your email - Auto Service 24',
  html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: #0d6efd; padding: 20px; text-align: center; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">Auto Service 24</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0;">Verify your email</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          Hi there 👋, <br><br>
          Thank you for registering with <b>Auto Service 24</b>.  
          Please confirm your email address by clicking the button below:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #0d6efd; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
            Verify Email
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">
          Or copy and paste this link in your browser: <br>
          <a href="${verifyUrl}" style="color: #0d6efd;">${verifyUrl}</a>
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} Auto Service 24. All rights reserved.
      </div>
    </div>
  </div>
  `
});

}

async verifyEmail(token: string) {
  try {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_VERIFICATION_SECRET,
    });
    
    const user = await this.userservice.getOneUserByEmail(payload.email);
    if (!user) throw new UnauthorizedException('Invalid token');
    
    const updatedUser = await this.userservice.update(user._id as string, {
      verified: true, 
      verificationToken: undefined
    });

    // Remove this line since updatedUser already contains the saved data
    // await user.save();

    return {
      status: true,
      message: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified Successfully</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f7fa;">
          <div style="
            text-align: center;
            padding: 40px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 50px auto;
          ">
            <h1 style="color: #261FB3;">✅ Email Verified!</h1>
            <p style="color: #333; font-size: 16px; margin: 20px 0;">
              Your email has been successfully verified. Thank you for confirming your account.
            </p>
            
          </div>
        </body>
        </html>
      `
    };
  } catch (e) {
    throw new UnauthorizedException('Invalid or expired verification token');
  }
}

  async editDetails(userId: string, body: EditUserDto) {
    const updatedUser = await this.userservice.update(userId, body);
    return {
      status: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  }




  ///

  async sendforgotPassword(email: string) {


    const user = await this.userservice.getOneUserByEmail( email );
    if (!user) throw new BadRequestException('user not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.resetModel.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await this.transporter.sendMail({
  from: `"Auto Service 24" `, ////
  to: email,
  subject: '🔑 Password recovery code',
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        
        <h2 style="color: #4CAF50; text-align: center;">Recover password</h2>
        <p style="font-size: 16px; color: #333;">Hello </p>
        <p style="font-size: 16px; color: #333;">
          You have requested to recover your password. Enter the following code in the app to complete the process:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #4CAF50; letter-spacing: 4px;">
            ${code}
          </span>
        </div>

        <p style="font-size: 14px; color: #555;">
         ⚠️ If you did not request a password recovery, you can ignore this email.
        </p>

        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
          © ${new Date().getFullYear()} Auto Service 24 All rights reserved..
        </p>
      </div>
    </div>
  `
});

    return { message: 'the code send Successfully' };
  }


  async verifyReset(email: string, code: string) {
    const reset = await this.resetModel.findOne({ email, code, used: false }).sort({ createdAt: -1 });

    if (!reset) throw new BadRequestException('Invalid code');
    if (reset.expiresAt < new Date()) throw new BadRequestException('The token has expired');

    return { message: 'code is true ' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userservice.getOneUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('User not found');

    const salt = bcrypt.genSaltSync(8);
    const newHashedPassword = bcrypt.hashSync(dto.newPassword, salt);

    await this.userservice.update(user.id, { password: newHashedPassword });

    
    await this.resetModel.updateMany({ email : dto.email, used: false }, { used: true });

    return {
      status: true,
      message: 'Password updated successfully',
    };
  }

  async verifyGoogleToken(idToken: string, userType: string, provider: string) {
    const res = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
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
        verified: true,
      });

      return this.buildPayload(newuser);
    }
  }

 async verifyFacebookToken(
  accessToken: string,
  userType: string,
  provider: string,
) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵 verifyFacebookToken called');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('accessToken received:', accessToken);
  console.log('accessToken type:', typeof accessToken);
  console.log('accessToken length:', accessToken?.length);
  console.log('accessToken first 30 chars:', accessToken?.substring(0, 30));
  console.log('userType:', userType);
  console.log('provider:', provider);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
    console.error('❌ Access token is invalid:', accessToken);
    throw new BadRequestException('Access token is required');
  }

  const url = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;
  console.log('📤 Calling Facebook API...');
  console.log('URL:', url.replace(accessToken, accessToken.substring(0, 20) + '...'));

  try {
    const res = await axios.get(url);
    
    console.log('✅ Facebook API Response:', res.data);
    console.log("✅ id is ", res.data.id)


    
    if (!res.data.id) {

      
      console.error('❌ No id in Facebook response:', res.data);
      throw new UnauthorizedException('id not provided by Facebook');
    }

    const user = await this.userservice.findByProvider(
      provider,
      res.data.sub || res.data.id,
    );

    if (user) {
      console.log('✅ Existing user found:', user.email);
      return this.buildPayload(user);
    } else {
      console.log('🆕 Creating new user...');

      const email = res.data.email || `${res.data.id}@facebook.local`;
      const newuser = await this.userservice.create({
        email: email,
        username: res.data.name,
        profile_image: res.data.picture?.data?.url,
        user_type: userType,
        provider: provider,
        providerId: res.data.id,
        verified: true
      });
      console.log('✅ New user created:', newuser.email);
      return this.buildPayload(newuser);
    }
  } catch (error) {
    console.error('❌ Facebook API Error:', error.response?.data || error.message);
    throw new UnauthorizedException('Invalid Facebook token');
  }
}

  async verifyAppleToken(
    identityToken: string,
    userType: string,
    provider: string,
  ) {
    try {
      const decoded: any = jwt.decode(identityToken); // decode لا تتحقق من التوقيع، الأفضل لاحقًا إضافة verify

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      // حاول جلب المستخدم عن طريق providerId
      const user = await this.userservice.findByProvider(provider, decoded.sub);

      if (user) {
        return this.buildPayload(user);
      } else {
        // اسم المستخدم ممكن تاخذه من الـ `decoded.name` لو موجود، أو تولده عشوائيًا
        const newUser = await this.userservice.create({
          provider: provider,
          providerId: decoded.sub,
          username: 'Apple User ' + Math.floor(Math.random() * 10000),
          user_type: userType,
          verified:true
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
      phone: user.phone, // أضف هذا السطر ✅
      profile_image: user.profile_image,
    };
  }

  async generateJwt(userpayload: PayloadDto) {
    return this.jwtService.sign(userpayload);
  }


}

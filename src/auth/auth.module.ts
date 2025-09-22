import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordReset, PasswordResetSchema } from './schema/PasswordReset.schema';
@Module({
  imports: [
    UserModule,
    PassportModule,

     MongooseModule.forFeature([
      { name: PasswordReset.name, schema: PasswordResetSchema }, // 👈 إضافة الموديل
    ]),
    JwtModule.register({
      secret: 'mohammed123',
      signOptions: { expiresIn: '100d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], // Export JwtModule to make JwtService available
})
export class AuthModule {}

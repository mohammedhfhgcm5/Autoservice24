import { AuthDto, EditUserDto, ForgotPasswordDto, PayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserDto } from 'src/user/dto/user.dto';
export declare class AuthService {
    private readonly userservice;
    private jwtService;
    constructor(userservice: UserService, jwtService: JwtService);
    logIn(authBody: AuthDto): Promise<{
        token: string;
        user: {
            email: string;
            _id: unknown;
            username: string;
            user_type: string;
            phone: string | undefined;
            profile_image: string | undefined;
        };
    }>;
    signUp(signupBody: UserDto): Promise<{
        status: boolean;
        message: string;
        user: import("mongoose").Document<unknown, {}, import("../user/user.schema").User, {}, {}> & import("../user/user.schema").User & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    editDetails(userId: string, body: EditUserDto): Promise<{
        status: boolean;
        message: string;
        user: import("../user/user.schema").User;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        status: boolean;
        message: string;
    }>;
    verifyGoogleToken(idToken: string, userType: string, provider: string): Promise<{
        email: any;
        _id: any;
        username: any;
        user_type: any;
        phone: any;
        profile_image: any;
    }>;
    verifyFacebookToken(accessToken: string, userType: string, provider: string): Promise<{
        email: any;
        _id: any;
        username: any;
        user_type: any;
        phone: any;
        profile_image: any;
    }>;
    verifyAppleToken(identityToken: string, userType: string, provider: string): Promise<{
        email: any;
        _id: any;
        username: any;
        user_type: any;
        phone: any;
        profile_image: any;
    }>;
    private buildPayload;
    generateJwt(userpayload: PayloadDto): Promise<string>;
}

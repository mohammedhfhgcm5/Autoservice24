import { AuthService } from './auth.service';
import { AuthDto, EditUserDto, ForgotPasswordDto, PayloadDto } from './dto/auth.dto';
import { UserDto } from 'src/user/dto/user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signin(authBody: AuthDto): Promise<{
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
    signup(file: Express.Multer.File, signupBody: UserDto): Promise<{
        status: boolean;
        message: string;
        user: import("mongoose").Document<unknown, {}, import("../user/user.schema").User, {}, {}> & import("../user/user.schema").User & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    editDetails(id: string, body: EditUserDto, file: Express.Multer.File): Promise<{
        status: boolean;
        message: string;
        user: import("../user/user.schema").User;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        status: boolean;
        message: string;
    }>;
    googleLogin(signUpbody: {
        idToken: string;
        usertype: string;
        provider: string;
    }): Promise<{
        token: string;
        user: {
            email: any;
            _id: any;
            username: any;
            user_type: any;
            phone: any;
            profile_image: any;
        };
    }>;
    socialLogin(signUpbody: {
        Token: string;
        usertype: string;
        provider: string;
    }): Promise<{
        token: string;
        user: PayloadDto;
    }>;
}

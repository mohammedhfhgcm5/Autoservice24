export declare class AuthDto {
    email: string;
    password: string;
}
export declare class PayloadDto {
    email?: string;
    _id: unknown;
    username: string;
    user_type: string;
}
export declare class EditUserDto {
    username?: string;
    email?: string;
    phone?: string;
    profile_image?: string;
    user_type?: string;
}
export declare class ForgotPasswordDto {
    email: string;
    newPassword: string;
}

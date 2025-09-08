import { Strategy } from 'passport-jwt';
import { PayloadDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private userService;
    constructor(userService: UserService);
    validate(payload: PayloadDto): Promise<PayloadDto>;
}
export {};

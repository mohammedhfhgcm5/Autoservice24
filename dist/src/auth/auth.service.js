"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const axios_1 = __importDefault(require("axios"));
const jwt = __importStar(require("jsonwebtoken"));
let AuthService = class AuthService {
    userservice;
    jwtService;
    constructor(userservice, jwtService) {
        this.userservice = userservice;
        this.jwtService = jwtService;
    }
    async logIn(authBody) {
        const user = await this.userservice.getOneUserByEmail(authBody.email);
        if (!user.password) {
            throw new common_1.UnauthorizedException();
        }
        if (!user || !bcrypt.compareSync(authBody.password, user.password)) {
            throw new common_1.UnauthorizedException();
        }
        const payload = {
            email: authBody.email,
            _id: user._id,
            username: user.username,
            user_type: user.user_type,
            phone: user.phone,
            profile_image: user.profile_image
        };
        return {
            token: this.jwtService.sign(payload),
            user: payload,
        };
    }
    async signUp(signupBody) {
        if (!signupBody.password) {
            throw new common_1.UnauthorizedException();
        }
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
            provider: 'local',
        });
        return {
            status: true,
            message: 'User created successfully',
            user: newUser,
        };
    }
    async editDetails(userId, body) {
        const updatedUser = await this.userservice.update(userId, body);
        return {
            status: true,
            message: 'User updated successfully',
            user: updatedUser,
        };
    }
    async forgotPassword(dto) {
        const user = await this.userservice.getOneUserByEmail(dto.email);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const salt = bcrypt.genSaltSync(16);
        const newHashedPassword = bcrypt.hashSync(dto.newPassword, salt);
        await this.userservice.update(user.id, { password: newHashedPassword });
        return {
            status: true,
            message: 'Password updated successfully',
        };
    }
    async verifyGoogleToken(idToken, userType, provider) {
        const res = await axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!res.data || !res.data.email)
            throw new common_1.UnauthorizedException();
        const user = await this.userservice.findByProvider(provider, res.data.sub || res.data.id);
        if (user) {
            return this.buildPayload(user);
        }
        else {
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
    }
    async verifyFacebookToken(accessToken, userType, provider) {
        const res = await axios_1.default.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
        if (!res.data || !res.data.email)
            throw new common_1.UnauthorizedException();
        const user = await this.userservice.findByProvider(provider, res.data.sub || res.data.id);
        if (user) {
            return this.buildPayload(user);
        }
        else {
            const newuser = await this.userservice.create({
                email: res.data.email,
                username: res.data.name,
                profile_image: res.data.picture?.data?.url,
                user_type: userType,
                provider: provider,
            });
            return this.buildPayload(newuser);
        }
    }
    async verifyAppleToken(identityToken, userType, provider) {
        try {
            const decoded = jwt.decode(identityToken);
            if (!decoded || !decoded.sub) {
                throw new common_1.UnauthorizedException('Invalid Apple token');
            }
            const user = await this.userservice.findByProvider(provider, decoded.sub);
            if (user) {
                return this.buildPayload(user);
            }
            else {
                const newUser = await this.userservice.create({
                    provider: provider,
                    providerId: decoded.sub,
                    username: 'Apple User ' + Math.floor(Math.random() * 10000),
                    user_type: userType,
                });
                return this.buildPayload(newUser);
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Failed to verify Apple token');
        }
    }
    buildPayload(user) {
        return {
            email: user.email,
            _id: user._id,
            username: user.username,
            user_type: user.user_type,
            phone: user.phone,
            profile_image: user.profile_image
        };
    }
    async generateJwt(userpayload) {
        return this.jwtService.sign(userpayload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
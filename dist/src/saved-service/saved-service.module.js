"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedServiceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const saved_service_service_1 = require("./saved-service.service");
const saved_service_controller_1 = require("./saved-service.controller");
const saved_service_schema_1 = require("./saved-service.schema");
const service_schema_1 = require("../service/service.schema");
const user_schema_1 = require("../user/user.schema");
let SavedServiceModule = class SavedServiceModule {
};
exports.SavedServiceModule = SavedServiceModule;
exports.SavedServiceModule = SavedServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: saved_service_schema_1.SavedService.name, schema: saved_service_schema_1.SavedServiceSchema },
                { name: service_schema_1.Service.name, schema: service_schema_1.ServiceSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
        ],
        controllers: [saved_service_controller_1.SavedServiceController],
        providers: [saved_service_service_1.SavedServiceService],
    })
], SavedServiceModule);
//# sourceMappingURL=saved-service.module.js.map
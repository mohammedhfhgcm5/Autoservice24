"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceSchema = exports.Service = exports.ServiceType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ServiceType;
(function (ServiceType) {
    ServiceType["VEHICLE_INSPECTION"] = "Vehicle inspection & emissions test";
    ServiceType["CHANGE_OIL"] = "Change oil";
    ServiceType["CHANGE_TIRES"] = "Change tires";
    ServiceType["REMOVE_INSTALL_TIRES"] = "Remove & install tires";
    ServiceType["CLEANING"] = "Cleaning";
    ServiceType["DIAGNOSTIC_TEST"] = "Test with diagnostic";
    ServiceType["PRE_TUV_CHECK"] = "Pre-T\u00DCV check";
    ServiceType["BALANCE_TIRES"] = "Balance tires";
    ServiceType["WHEEL_ALIGNMENT"] = "Adjust wheel alignment";
    ServiceType["POLISH"] = "Polish";
    ServiceType["CHANGE_BRAKE_FLUID"] = "Change brake fluid";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
let Service = class Service {
    workshop_id;
    title;
    description;
    price;
    images;
    service_type;
};
exports.Service = Service;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'workShop', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Service.prototype, "workshop_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Service.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Service.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Service.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Service.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(ServiceType),
        required: true,
    }),
    __metadata("design:type", String)
], Service.prototype, "service_type", void 0);
exports.Service = Service = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Service);
exports.ServiceSchema = mongoose_1.SchemaFactory.createForClass(Service);
//# sourceMappingURL=service.schema.js.map
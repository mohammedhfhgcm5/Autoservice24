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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedServiceController = void 0;
const common_1 = require("@nestjs/common");
const saved_service_service_1 = require("./saved-service.service");
const create_saved_service_dto_1 = require("./dto/create-saved-service.dto");
const update_saved_service_dto_1 = require("./dto/update-saved-service.dto");
let SavedServiceController = class SavedServiceController {
    savedServiceService;
    constructor(savedServiceService) {
        this.savedServiceService = savedServiceService;
    }
    create(dto) {
        return this.savedServiceService.create(dto);
    }
    findAll() {
        return this.savedServiceService.findAll();
    }
    findOne(id) {
        return this.savedServiceService.findOne(id);
    }
    update(id, dto) {
        return this.savedServiceService.update(id, dto);
    }
    remove(id) {
        return this.savedServiceService.remove(id);
    }
};
exports.SavedServiceController = SavedServiceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_saved_service_dto_1.CreateSavedServiceDto]),
    __metadata("design:returntype", void 0)
], SavedServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SavedServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SavedServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_saved_service_dto_1.UpdateSavedServiceDto]),
    __metadata("design:returntype", void 0)
], SavedServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SavedServiceController.prototype, "remove", null);
exports.SavedServiceController = SavedServiceController = __decorate([
    (0, common_1.Controller)('saved-services'),
    __metadata("design:paramtypes", [saved_service_service_1.SavedServiceService])
], SavedServiceController);
//# sourceMappingURL=saved-service.controller.js.map
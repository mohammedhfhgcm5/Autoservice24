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
exports.SavedServiceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const saved_service_schema_1 = require("./saved-service.schema");
let SavedServiceService = class SavedServiceService {
    savedServiceModel;
    constructor(savedServiceModel) {
        this.savedServiceModel = savedServiceModel;
    }
    async create(dto) {
        const saved = new this.savedServiceModel(dto);
        return saved.save();
    }
    async findAll() {
        return this.savedServiceModel
            .find()
            .populate('user_id')
            .populate('service_id')
            .lean()
            .exec();
    }
    async findOne(id) {
        const saved = await this.savedServiceModel
            .findById(id)
            .populate('user_id')
            .populate('service_id')
            .lean();
        if (!saved)
            throw new common_1.NotFoundException('Saved service not found');
        return saved;
    }
    async update(id, dto) {
        const updated = await this.savedServiceModel.findByIdAndUpdate(id, dto, {
            new: true,
            runValidators: true,
        });
        if (!updated)
            throw new common_1.NotFoundException('Saved service not found');
        return updated;
    }
    async remove(id) {
        const result = await this.savedServiceModel.findByIdAndDelete(id);
        if (!result)
            throw new common_1.NotFoundException('Saved service not found');
        return { success: true };
    }
};
exports.SavedServiceService = SavedServiceService;
exports.SavedServiceService = SavedServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(saved_service_schema_1.SavedService.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SavedServiceService);
//# sourceMappingURL=saved-service.service.js.map
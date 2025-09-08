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
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const service_schema_1 = require("./service.schema");
let ServiceService = class ServiceService {
    serviceModel;
    constructor(serviceModel) {
        this.serviceModel = serviceModel;
    }
    async create(dto) {
        const newService = new this.serviceModel(dto);
        return newService.save();
    }
    async findAll(serviceType) {
        const filter = serviceType ? { service_type: serviceType } : {};
        return this.serviceModel.find(filter).populate('workshop_id').lean().exec();
    }
    async search(query, serviceType) {
        const filter = {};
        if (serviceType)
            filter.service_type = serviceType;
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ];
        }
        return this.serviceModel.find(filter).populate('workshop_id').lean().exec();
    }
    async findOne(id) {
        const service = await this.serviceModel
            .findById(id)
            .populate('workshop_id')
            .lean();
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return service;
    }
    async update(id, dto) {
        const updated = await this.serviceModel.findByIdAndUpdate(id, dto, {
            new: true,
            runValidators: true,
        });
        if (!updated)
            throw new common_1.NotFoundException('Service not found');
        return updated;
    }
    async remove(id) {
        const result = await this.serviceModel.findByIdAndDelete(id);
        if (!result)
            throw new common_1.NotFoundException('Service not found');
        return { success: true };
    }
    async addImages(id, images) {
        const updated = await this.serviceModel.findByIdAndUpdate(id, { $push: { images: { $each: images } } }, { new: true });
        if (!updated)
            throw new common_1.NotFoundException('Service not found');
        return updated;
    }
    getServiceTypes() {
        return Object.values(service_schema_1.ServiceType);
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(service_schema_1.Service.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServiceService);
//# sourceMappingURL=service.service.js.map
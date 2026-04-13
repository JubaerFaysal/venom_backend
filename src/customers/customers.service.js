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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
let CustomersService = class CustomersService {
    customerRepo;
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }
    async findAll(page = 1, limit = 10) {
        const [data, total] = await this.customerRepo.findAndCount({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async search(query) {
        const search = `%${query}%`;
        return this.customerRepo
            .createQueryBuilder('customer')
            .select([
            'customer.id',
            'customer.name',
            'customer.displayName',
            'customer.phone',
            'customer.email',
            'customer.createdAt',
        ])
            .where('customer.name ILIKE :search OR customer.displayName ILIKE :search OR customer.phone ILIKE :search OR customer.email ILIKE :search', { search })
            .orderBy('customer.createdAt', 'DESC')
            .getMany();
    }
    async create(dto) {
        const customer = this.customerRepo.create(dto);
        return this.customerRepo.save(customer);
    }
    async findOne(id) {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer ${id} not found`);
        }
        return customer;
    }
    async update(id, dto) {
        const updateData = Object.fromEntries(Object.entries(dto).filter(([_, value]) => value !== undefined));
        if (Object.keys(updateData).length > 0) {
            await this.customerRepo.update({ id }, updateData);
        }
        return this.findOne(id);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map
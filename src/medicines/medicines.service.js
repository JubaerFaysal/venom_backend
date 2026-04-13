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
exports.MedicinesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medicine_entity_1 = require("./entities/medicine.entity");
let MedicinesService = class MedicinesService {
    medicineRepo;
    constructor(medicineRepo) {
        this.medicineRepo = medicineRepo;
    }
    async findAll(options) {
        const { search, filter, brand } = options;
        const page = Math.max(1, options.page ?? 1);
        const limit = Math.min(100, Math.max(1, options.limit ?? 20));
        const offset = (page - 1) * limit;
        const qb = this.medicineRepo.createQueryBuilder('medicine');
        if (brand) {
            qb.andWhere('medicine.brand = :brand', { brand });
        }
        if (filter === 'in-stock') {
            qb.andWhere('medicine.stockQuantity > 0');
        }
        else if (filter === 'out-of-stock') {
            qb.andWhere('medicine.stockQuantity = 0');
        }
        else if (filter === 'discount') {
            qb.andWhere('medicine.isDiscounted = true');
        }
        if (search) {
            const s = `%${search}%`;
            qb.andWhere('medicine.name ILIKE :s OR medicine.generic ILIKE :s OR medicine.barcode ILIKE :s', { s });
        }
        qb.orderBy('medicine.id', 'DESC');
        qb.skip(offset).take(limit);
        const [data, total] = await qb.getManyAndCount();
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
    async findOne(id) {
        const medicine = await this.medicineRepo.findOne({ where: { id } });
        if (!medicine) {
            throw new common_1.NotFoundException(`Medicine ${id} not found`);
        }
        return medicine;
    }
    async create(dto) {
        const medicine = this.medicineRepo.create(dto);
        return this.medicineRepo.save(medicine);
    }
    async update(id, dto) {
        const updateData = Object.fromEntries(Object.entries(dto).filter(([_, value]) => value !== undefined));
        await this.medicineRepo.update({ id }, updateData);
        return this.findOne(id);
    }
    async updateStock(id, quantity) {
        await this.medicineRepo.decrement({ id }, 'stockQuantity', quantity);
    }
    async seedData() {
        const medicines = [
            {
                name: 'Paracetamol 500mg',
                generic: 'Paracetamol',
                barcode: '123456789',
                brand: 'Square',
                price: 180,
                stockQuantity: 150,
                isDiscounted: true,
                discountPercent: 5,
            },
            {
                name: 'Napa 500mg',
                generic: 'Paracetamol',
                barcode: '123456790',
                brand: 'Beximco',
                price: 150,
                stockQuantity: 200,
                isDiscounted: false,
                discountPercent: 0,
            },
            {
                name: 'Ace 500mg',
                generic: 'Paracetamol',
                barcode: '123456791',
                brand: 'Square',
                price: 160,
                stockQuantity: 0,
                isDiscounted: false,
                discountPercent: 0,
            },
            {
                name: 'Napa Extra',
                generic: 'Paracetamol+Caffeine',
                barcode: '123456792',
                brand: 'Beximco',
                price: 220,
                stockQuantity: 100,
                isDiscounted: true,
                discountPercent: 10,
            },
            {
                name: 'Ibuprofen 400mg',
                generic: 'Ibuprofen',
                barcode: '123456793',
                brand: 'Incepta',
                price: 120,
                stockQuantity: 300,
                isDiscounted: false,
                discountPercent: 0,
            },
            {
                name: 'Ranitidine 150mg',
                generic: 'Ranitidine',
                barcode: '123456794',
                brand: 'Opsonin',
                price: 90,
                stockQuantity: 250,
                isDiscounted: false,
                discountPercent: 0,
            },
        ];
        const existingBarcodes = (await this.medicineRepo
            .createQueryBuilder('medicine')
            .select('medicine.barcode')
            .where('medicine.barcode IN (:...barcodes)', {
            barcodes: medicines.map(m => m.barcode),
        })
            .getMany()).map(m => m.barcode);
        const medicinesToInsert = medicines
            .filter(med => !existingBarcodes.includes(med.barcode))
            .map(med => this.medicineRepo.create(med));
        if (medicinesToInsert.length > 0) {
            await this.medicineRepo.save(medicinesToInsert);
        }
        return { message: 'Seed data loaded successfully' };
    }
};
exports.MedicinesService = MedicinesService;
exports.MedicinesService = MedicinesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medicine_entity_1.Medicine)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MedicinesService);
//# sourceMappingURL=medicines.service.js.map
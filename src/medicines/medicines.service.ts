import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateMedicineDto } from './dto/medicine.dto';
import { UpdateMedicineDto } from './dto/update_medicine.dto';
import { Medicine } from './entities/medicine.entity';

interface FindAllOptions {
  search?: string;
  filter?: 'all' | 'in-stock' | 'out-of-stock' | 'discount';
  brand?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepo: Repository<Medicine>,
  ) {}

async findAll(options: FindAllOptions) {
  const { search, filter, brand } = options;
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const offset = (page - 1) * limit;

  const qb = this.medicineRepo
    .createQueryBuilder('medicine')

  if (brand) {
    qb.andWhere('medicine.brand = :brand', { brand });
  }

  if (filter === 'in-stock') {
    qb.andWhere('medicine.stockQuantity > 0');
  } else if (filter === 'out-of-stock') {
    qb.andWhere('medicine.stockQuantity = 0');
  } else if (filter === 'discount') {
    qb.andWhere('medicine.isDiscounted = true');
  }

  if (search) {
    const s = `%${search}%`;

    qb.andWhere(
      new Brackets((sub) => {
        sub
          .where('medicine.name ILIKE :s', { s })
          .orWhere('medicine.generic ILIKE :s', { s })
          .orWhere('medicine.barcode ILIKE :s', { s });
      }),
    );
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


  async findOne(id: number): Promise<Medicine> {
    const medicine = await this.medicineRepo.findOne({ where: { id } });
    if (!medicine) {
      throw new NotFoundException(`Medicine ${id} not found`);
    }
    return medicine;
  }

  async create(dto: CreateMedicineDto): Promise<Medicine> {
    const medicine = this.medicineRepo.create(dto);
    return this.medicineRepo.save(medicine);
  }

  async update(id: number, dto: UpdateMedicineDto): Promise<Medicine> {
    await this.medicineRepo.update({ id }, dto);
    return this.findOne(id);
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.medicineRepo.decrement({ id }, 'stockQuantity', quantity);
  }

  async seedData() {
    const medicines = [
      { name: 'Paracetamol 500mg', generic: 'Paracetamol', barcode: '123456789', brand: 'Square', price: 180, stockQuantity: 150, isDiscounted: true, discountPercent: 5 },
      { name: 'Napa 500mg', generic: 'Paracetamol', barcode: '123456790', brand: 'Beximco', price: 150, stockQuantity: 200, isDiscounted: false, discountPercent: 0 },
      { name: 'Ace 500mg', generic: 'Paracetamol', barcode: '123456791', brand: 'Square', price: 160, stockQuantity: 0, isDiscounted: false, discountPercent: 0 },
      { name: 'Napa Extra', generic: 'Paracetamol+Caffeine', barcode: '123456792', brand: 'Beximco', price: 220, stockQuantity: 100, isDiscounted: true, discountPercent: 10 },
      { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', barcode: '123456793', brand: 'Incepta', price: 120, stockQuantity: 300, isDiscounted: false, discountPercent: 0 },
      { name: 'Ranitidine 150mg', generic: 'Ranitidine', barcode: '123456794', brand: 'Opsonin', price: 90, stockQuantity: 250, isDiscounted: false, discountPercent: 0 },
    ];
    
    for (const med of medicines) {
      const exists = await this.medicineRepo.findOne({ where: { barcode: med.barcode } });
      if (!exists) {
        await this.create(med);
      }
    }
    return { message: 'Seed completed' };
  }
}
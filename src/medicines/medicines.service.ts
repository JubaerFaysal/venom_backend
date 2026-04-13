import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const qb = this.medicineRepo.createQueryBuilder('medicine');

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
        'medicine.name ILIKE :s OR medicine.generic ILIKE :s OR medicine.barcode ILIKE :s',
        { s },
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
    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined)
    );
    await this.medicineRepo.update({ id }, updateData);
    return this.findOne(id);
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.medicineRepo.decrement({ id }, 'stockQuantity', quantity);
  }

  async seedData() {
    const medicines = [
      {
        name: 'Paracetamol 500mg',
        generic: 'Paracetamol',
        barcode: '8901234567890',
        brand: 'Square',
        price: 180,
        stockQuantity: 150,
        isDiscounted: true,
        discountPercent: 5,
        imageUrl: 'https://images.pexels.com/photos/9155926/pexels-photo-9155926.jpeg',
      },
      {
        name: 'Napa 500mg',
        generic: 'Paracetamol',
        barcode: '8901234567891',
        brand: 'Beximco',
        price: 150,
        stockQuantity: 200,
        isDiscounted: false,
        discountPercent: 0,
        imageUrl: 'https://images.pexels.com/photos/5752142/pexels-photo-5752142.jpeg',
      },
      {
        name: 'Ace 500mg',
        generic: 'Paracetamol',
        barcode: '8901234567892',
        brand: 'Square',
        price: 160,
        stockQuantity: 0,
        isDiscounted: false,
        discountPercent: 0,
        imageUrl: 'https://images.pexels.com/photos/6032619/pexels-photo-6032619.jpeg',
      },
      {
        name: 'Napa Extra',
        generic: 'Paracetamol+Caffeine',
        barcode: '8901234567893',
        brand: 'Beximco',
        price: 220,
        stockQuantity: 100,
        isDiscounted: true,
        discountPercent: 10,
        imageUrl: 'https://images.pexels.com/photos/4332674/pexels-photo-4332674.jpeg',
      },
      {
        name: 'Ibuprofen 400mg',
        generic: 'Ibuprofen',
        barcode: '8901234567894',
        brand: 'Incepta',
        price: 120,
        stockQuantity: 300,
        isDiscounted: false,
        discountPercent: 0,
        imageUrl: 'https://images.pexels.com/photos/7748667/pexels-photo-7748667.jpeg',
      },
      {
        name: 'Ranitidine 150mg',
        generic: 'Ranitidine',
        barcode: '8901234567895',
        brand: 'Opsonin',
        price: 90,
        stockQuantity: 250,
        isDiscounted: false,
        discountPercent: 0,
        imageUrl: 'https://images.pexels.com/photos/6032627/pexels-photo-6032627.jpeg',
      },
    ];

    const existingBarcodes = (await this.medicineRepo
      .createQueryBuilder('medicine')
      .select('medicine.barcode')
      .where('medicine.barcode IN (:...barcodes)', {
        barcodes: medicines.map(m => m.barcode),
      })
      .getMany()
    ).map(m => m.barcode);

    const medicinesToInsert = medicines
      .filter(med => !existingBarcodes.includes(med.barcode))
      .map(med => this.medicineRepo.create(med));

    if (medicinesToInsert.length > 0) {
      await this.medicineRepo.save(medicinesToInsert);
    }

    return { message: 'Seed data loaded successfully' };
  }
}
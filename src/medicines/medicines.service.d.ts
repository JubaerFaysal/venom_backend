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
export declare class MedicinesService {
    private medicineRepo;
    constructor(medicineRepo: Repository<Medicine>);
    findAll(options: FindAllOptions): Promise<{
        data: Medicine[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<Medicine>;
    create(dto: CreateMedicineDto): Promise<Medicine>;
    update(id: number, dto: UpdateMedicineDto): Promise<Medicine>;
    updateStock(id: number, quantity: number): Promise<void>;
    seedData(): Promise<{
        message: string;
    }>;
}
export {};

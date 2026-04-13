import { CreateMedicineDto } from './dto/medicine.dto';
import { UpdateMedicineDto } from './dto/update_medicine.dto';
import { Medicine } from './entities/medicine.entity';
import { MedicinesService } from './medicines.service';
export declare class MedicinesController {
    private readonly medicinesService;
    constructor(medicinesService: MedicinesService);
    findAll(search?: string, filter?: 'all' | 'in-stock' | 'out-of-stock' | 'discount', brand?: string, page?: number, limit?: number): Promise<{
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
    seed(): Promise<{
        message: string;
    }>;
}

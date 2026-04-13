import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateMedicineDto } from './dto/medicine.dto';
import { UpdateMedicineDto } from './dto/update_medicine.dto';
import { Medicine } from './entities/medicine.entity';
import { MedicinesService } from './medicines.service';

@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('filter') filter?: 'all' | 'in-stock' | 'out-of-stock' | 'discount',
    @Query('brand') brand?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.medicinesService.findAll({
      search,
      filter,
      brand,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Medicine> {
    return this.medicinesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateMedicineDto): Promise<Medicine> {
    return this.medicinesService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateMedicineDto): Promise<Medicine> {
    return this.medicinesService.update(id, dto);
  }

  @Post('seed')
  async seed() {
    return this.medicinesService.seedData();
  }
}
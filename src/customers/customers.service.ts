import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
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

  async search(query: string): Promise<Customer[]> {
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
      .where(
        'customer.name ILIKE :search OR customer.displayName ILIKE :search OR customer.phone ILIKE :search OR customer.email ILIKE :search',
        { search },
      )
      .orderBy('customer.createdAt', 'DESC')
      .getMany();
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepo.create(dto);
    return this.customerRepo.save(customer);
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length > 0) {
      await this.customerRepo.update({ id }, updateData);
    }
    return this.findOne(id);
  }
}
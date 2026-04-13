import { Repository } from 'typeorm';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from './entities/customer.entity';
export declare class CustomersService {
    private customerRepo;
    constructor(customerRepo: Repository<Customer>);
    findAll(page?: number, limit?: number): Promise<{
        data: Customer[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    search(query: string): Promise<Customer[]>;
    create(dto: CreateCustomerDto): Promise<Customer>;
    findOne(id: number): Promise<Customer>;
    update(id: number, dto: UpdateCustomerDto): Promise<Customer>;
}

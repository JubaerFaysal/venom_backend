import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from './entities/customer.entity';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
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
    findOne(id: number): Promise<Customer>;
    create(dto: CreateCustomerDto): Promise<Customer>;
    update(id: number, dto: UpdateCustomerDto): Promise<Customer>;
}

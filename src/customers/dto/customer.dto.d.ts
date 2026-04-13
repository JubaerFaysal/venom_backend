import { CustomerType } from '../entities/customer.entity';
export declare class CreateCustomerDto {
    type?: CustomerType;
    title?: string;
    name: string;
    displayName: string;
    phone: string;
    email?: string;
    billingAddress?: string;
}
export declare class UpdateCustomerDto {
    type?: CustomerType;
    title?: string;
    name?: string;
    displayName?: string;
    phone?: string;
    email?: string;
    billingAddress?: string;
}

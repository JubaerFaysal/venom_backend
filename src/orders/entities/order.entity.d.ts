import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order_item.entity';
export declare enum OrderStatus {
    DRAFT = "draft",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethod {
    CASH = "cash",
    BANK_CARD = "bank_card",
    MFS = "mfs"
}
export declare class Order {
    id: number;
    customer: Customer;
    customerId: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    subtotal: number;
    vatAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    returnAmount: number;
    createdAt: Date;
    items: OrderItem[];
}

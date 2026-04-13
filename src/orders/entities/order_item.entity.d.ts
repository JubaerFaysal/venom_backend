import { Order } from './order.entity';
export declare class OrderItem {
    id: number;
    order: Order;
    orderId: number;
    medicineId: number;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    subtotal: number;
}

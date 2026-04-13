export declare class OrderItemDto {
    medicineId: number;
    quantity: number;
    discountPercent?: number;
}
export declare class CreateOrderDto {
    customerId?: number;
    items: OrderItemDto[];
}
export declare class UpdateOrderItemDto {
    quantity?: number;
    discountPercent?: number;
}
export declare class UpdateOrderDto {
    customerId?: number;
    discountPercent?: number;
}

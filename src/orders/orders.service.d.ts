import { Repository } from 'typeorm';
import { MedicinesService } from '../medicines/medicines.service';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderItemDto } from './dto/order.dto';
import { PaymentDto } from './dto/payment.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
export declare class OrdersService {
    private orderRepo;
    private itemRepo;
    private medicinesService;
    constructor(orderRepo: Repository<Order>, itemRepo: Repository<OrderItem>, medicinesService: MedicinesService);
    create(dto: CreateOrderDto): Promise<Order>;
    processPayment(orderId: number, dto: PaymentDto): Promise<Order>;
    updateOrderItem(orderId: number, itemId: number, dto: UpdateOrderItemDto): Promise<Order>;
    removeOrderItem(orderId: number, itemId: number): Promise<Order>;
    updateOrder(orderId: number, dto: UpdateOrderDto): Promise<Order>;
    private recalculateOrderTotals;
    findAll(status?: OrderStatus, customerId?: number, page?: number, limit?: number): Promise<{
        data: Order[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<Order>;
}

import { CreateOrderDto, UpdateOrderItemDto, UpdateOrderDto } from './dto/order.dto';
import { PaymentDto } from './dto/payment.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<Order>;
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
    updateOrder(orderId: number, dto: UpdateOrderDto): Promise<Order>;
    updateOrderItem(orderId: number, itemId: number, dto: UpdateOrderItemDto): Promise<Order>;
    removeOrderItem(orderId: number, itemId: number): Promise<Order>;
    processPayment(orderId: number, dto: PaymentDto): Promise<Order>;
}

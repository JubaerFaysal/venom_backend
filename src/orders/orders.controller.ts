import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateOrderDto, UpdateOrderItemDto, UpdateOrderDto } from './dto/order.dto';
import { PaymentDto } from './dto/payment.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Get()
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('customerId') customerId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.ordersService.findAll(status, customerId, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  async updateOrder(
    @Param('id') orderId: number,
    @Body() dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.updateOrder(orderId, dto);
  }

  @Put(':id/items/:itemId')
  async updateOrderItem(
    @Param('id') orderId: number,
    @Param('itemId') itemId: number,
    @Body() dto: UpdateOrderItemDto,
  ): Promise<Order> {
    return this.ordersService.updateOrderItem(orderId, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  async removeOrderItem(
    @Param('id') orderId: number,
    @Param('itemId') itemId: number,
  ): Promise<Order> {
    return this.ordersService.removeOrderItem(orderId, itemId);
  }

  @Post(':id/payment')
  async processPayment(
    @Param('id') orderId: number,
    @Body() dto: PaymentDto,
  ): Promise<Order> {
    return this.ordersService.processPayment(orderId, dto);
  }
}
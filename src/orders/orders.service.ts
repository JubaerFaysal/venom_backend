import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicinesService } from '../medicines/medicines.service';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderItemDto } from './dto/order.dto';
import { PaymentDto } from './dto/payment.dto';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';

const VAT_RATE = 0.10;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private itemRepo: Repository<OrderItem>,
    private medicinesService: MedicinesService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create({
      customerId: dto.customerId,
      status: OrderStatus.DRAFT,
    });

    await this.orderRepo.save(order);

    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of dto.items) {
      const medicine = await this.medicinesService.findOne(item.medicineId);
      if (!medicine) throw new NotFoundException(`Medicine ${item.medicineId} not found`);

      if (medicine.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}`,
        );
      }

      const unitPrice = medicine.discountedPrice;
      const quantity = item.quantity;
      const discountPercent = item.discountPercent || 0;

      const itemSubtotal = unitPrice * quantity * (1 - discountPercent / 100);
      subtotal += itemSubtotal;

      const orderItem = this.itemRepo.create({
        orderId: order.id,
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity,
        unitPrice: Number(unitPrice),
        discountPercent,
        subtotal: Number(itemSubtotal.toFixed(2)),
      });

      orderItems.push(orderItem);
    }

    await this.itemRepo.save(orderItems);

    const vatAmount = subtotal * VAT_RATE;
    const totalAmount = subtotal + vatAmount;

    order.subtotal = Number(subtotal.toFixed(2));
    order.vatAmount = Number(vatAmount.toFixed(2));
    order.totalAmount = Number(totalAmount.toFixed(2));
    order.dueAmount = Number(totalAmount.toFixed(2));

    await this.orderRepo.save(order);
    return this.findOne(order.id);
  }

  async processPayment(orderId: number, dto: PaymentDto): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only process payment for draft orders');
    }

    const totalAmount = Number(order.totalAmount);
    const paymentAmount = Number(dto.amount);

    order.paymentMethod = dto.method as PaymentMethod;
    order.paidAmount = paymentAmount;
    order.dueAmount = Math.max(0, Number((totalAmount - paymentAmount).toFixed(2)));
    order.returnAmount = paymentAmount > totalAmount ? Number((paymentAmount - totalAmount).toFixed(2)) : 0;
    order.status = OrderStatus.COMPLETED;

    for (const item of order.items) {
      await this.medicinesService.updateStock(item.medicineId, item.quantity);
    }

    await this.orderRepo.save(order);
    return order;
  }

  async updateOrderItem(orderId: number, itemId: number, dto: UpdateOrderItemDto): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only modify draft orders');
    }

    const item = await this.itemRepo.findOne({ where: { id: itemId, orderId } });
    if (!item) throw new NotFoundException(`Order item ${itemId} not found`);

    if (dto.quantity && dto.quantity !== item.quantity) {
      const medicine = await this.medicinesService.findOne(item.medicineId);
      const quantityDifference = dto.quantity - item.quantity;
      if (medicine.stockQuantity < quantityDifference) {
        throw new BadRequestException(`Insufficient stock for ${medicine.name}`);
      }
    }

    if (dto.quantity) item.quantity = dto.quantity;
    if (dto.discountPercent !== undefined) item.discountPercent = dto.discountPercent;

    item.subtotal = Number((Number(item.unitPrice) * item.quantity * (1 - item.discountPercent / 100)).toFixed(2));
    await this.itemRepo.save(item);

    return this.recalculateOrderTotals(orderId);
  }

  async removeOrderItem(orderId: number, itemId: number): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only modify draft orders');
    }

    const item = await this.itemRepo.findOne({ where: { id: itemId, orderId } });
    if (!item) throw new NotFoundException(`Order item ${itemId} not found`);

    await this.itemRepo.remove(item);
    return this.recalculateOrderTotals(orderId);
  }

  async updateOrder(orderId: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only modify draft orders');
    }

    if (dto.customerId) order.customerId = dto.customerId;
    if (dto.discountPercent !== undefined) order.discountAmount = Number((Number(order.subtotal) * (dto.discountPercent / 100)).toFixed(2));

    return this.recalculateOrderTotals(orderId);
  }

  private async recalculateOrderTotals(orderId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'customer'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    let subtotal = 0;
    for (const item of order.items) {
      subtotal += Number(item.subtotal);
    }

    const vatAmount = Number((subtotal * VAT_RATE).toFixed(2));
    const totalAmount = Number((subtotal + vatAmount).toFixed(2));
    const discountAmount = Number(order.discountAmount || 0);

    order.subtotal = Number(subtotal.toFixed(2));
    order.vatAmount = vatAmount;
    order.totalAmount = totalAmount;
    order.dueAmount = Number((totalAmount - discountAmount).toFixed(2));

    await this.orderRepo.save(order);
    return order;
  }

  async findAll(
    status?: OrderStatus,
    customerId?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Order[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const query = this.orderRepo.createQueryBuilder('order');

    if (status) {
      query.where('order.status = :status', { status });
    }

    if (customerId) {
      query.andWhere('order.customerId = :customerId', { customerId });
    }

    query.leftJoinAndSelect('order.items', 'items');
    query.leftJoinAndSelect('order.customer', 'customer');
    query.orderBy('order.createdAt', 'DESC');

    const [data, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();

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

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'customer'],
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }
}
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medicines_service_1 = require("../medicines/medicines.service");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order_item.entity");
const VAT_RATE = 0.10;
let OrdersService = class OrdersService {
    orderRepo;
    itemRepo;
    medicinesService;
    constructor(orderRepo, itemRepo, medicinesService) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
        this.medicinesService = medicinesService;
    }
    async create(dto) {
        const order = this.orderRepo.create({
            customerId: dto.customerId,
            status: order_entity_1.OrderStatus.DRAFT,
        });
        await this.orderRepo.save(order);
        let subtotal = 0;
        const orderItems = [];
        for (const item of dto.items) {
            const medicine = await this.medicinesService.findOne(item.medicineId);
            if (!medicine)
                throw new common_1.NotFoundException(`Medicine ${item.medicineId} not found`);
            if (medicine.stockQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}`);
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
    async processPayment(orderId, dto) {
        const order = await this.findOne(orderId);
        if (order.status !== order_entity_1.OrderStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only process payment for draft orders');
        }
        const totalAmount = Number(order.totalAmount);
        const paymentAmount = Number(dto.amount);
        order.paymentMethod = dto.method;
        order.paidAmount = paymentAmount;
        order.dueAmount = Math.max(0, Number((totalAmount - paymentAmount).toFixed(2)));
        order.returnAmount = paymentAmount > totalAmount ? Number((paymentAmount - totalAmount).toFixed(2)) : 0;
        order.status = order_entity_1.OrderStatus.COMPLETED;
        for (const item of order.items) {
            await this.medicinesService.updateStock(item.medicineId, item.quantity);
        }
        await this.orderRepo.save(order);
        return order;
    }
    async updateOrderItem(orderId, itemId, dto) {
        const order = await this.findOne(orderId);
        if (order.status !== order_entity_1.OrderStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only modify draft orders');
        }
        const item = await this.itemRepo.findOne({ where: { id: itemId, orderId } });
        if (!item)
            throw new common_1.NotFoundException(`Order item ${itemId} not found`);
        if (dto.quantity && dto.quantity !== item.quantity) {
            const medicine = await this.medicinesService.findOne(item.medicineId);
            const quantityDifference = dto.quantity - item.quantity;
            if (medicine.stockQuantity < quantityDifference) {
                throw new common_1.BadRequestException(`Insufficient stock for ${medicine.name}`);
            }
        }
        if (dto.quantity)
            item.quantity = dto.quantity;
        if (dto.discountPercent !== undefined)
            item.discountPercent = dto.discountPercent;
        item.subtotal = Number((Number(item.unitPrice) * item.quantity * (1 - item.discountPercent / 100)).toFixed(2));
        await this.itemRepo.save(item);
        return this.recalculateOrderTotals(orderId);
    }
    async removeOrderItem(orderId, itemId) {
        const order = await this.findOne(orderId);
        if (order.status !== order_entity_1.OrderStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only modify draft orders');
        }
        const item = await this.itemRepo.findOne({ where: { id: itemId, orderId } });
        if (!item)
            throw new common_1.NotFoundException(`Order item ${itemId} not found`);
        await this.itemRepo.remove(item);
        return this.recalculateOrderTotals(orderId);
    }
    async updateOrder(orderId, dto) {
        const order = await this.findOne(orderId);
        if (order.status !== order_entity_1.OrderStatus.DRAFT) {
            throw new common_1.BadRequestException('Can only modify draft orders');
        }
        if (dto.customerId)
            order.customerId = dto.customerId;
        if (dto.discountPercent !== undefined)
            order.discountAmount = Number((Number(order.subtotal) * (dto.discountPercent / 100)).toFixed(2));
        return this.recalculateOrderTotals(orderId);
    }
    async recalculateOrderTotals(orderId) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['items', 'customer'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
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
    async findAll(status, customerId, page = 1, limit = 10) {
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
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['items', 'customer'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${id} not found`);
        }
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        medicines_service_1.MedicinesService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
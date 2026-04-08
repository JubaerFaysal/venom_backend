import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order_item.entity';

export enum OrderStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_CARD = 'bank_card',
  MFS = 'mfs'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ nullable: true })
  customerId!: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
  status!: OrderStatus;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod!: PaymentMethod;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  vatAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  dueAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  returnAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items!: OrderItem[];
}

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business'
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: CustomerType, default: CustomerType.INDIVIDUAL })
  type?: CustomerType;

  @Column()
  title?: string;

  @Column()
  name?: string;

  @Column()
  displayName?: string;

  @Column({ unique: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  billingAddress?: string;

  @CreateDateColumn()
  createdAt?: Date;
}
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  generic!: string;

  @Column({ unique: true })
  barcode!: string;

  @Column()
  brand!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('int')
  stockQuantity!: number;

  @Column({ default: false })
  isDiscounted!: boolean;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercent!: number;

  @Column({ nullable: true })
  imageUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get isInStock(): boolean {
    return this.stockQuantity > 0;
  }

  get discountedPrice(): number {
    if (!this.isDiscounted || this.discountPercent === 0) return Number(this.price);
    return Number(this.price) * (1 - Number(this.discountPercent) / 100);
  }
}
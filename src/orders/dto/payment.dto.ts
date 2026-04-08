import { IsIn, IsNumber, IsPositive } from 'class-validator';
import { PaymentMethod } from '../entities/order.entity';

export class PaymentDto {
  @IsIn(['cash', 'bank_card', 'mfs'])
  method!: PaymentMethod;

  @IsNumber()
  @IsPositive()
  amount!: number;
}
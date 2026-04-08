import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, Max, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @IsNumber()
  medicineId!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

export class UpdateOrderItemDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;
}

export class UpdateOrderDto {
  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;
}
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  name!: string;

  @IsString()
  generic!: string;

  @IsString()
  barcode!: string;

  @IsString()
  brand!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @IsBoolean()
  @IsOptional()
  isDiscounted?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  // Note: discountedPrice is automatically calculated from isDiscounted and discountPercent
}

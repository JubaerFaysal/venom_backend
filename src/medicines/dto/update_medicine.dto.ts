import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";

export class UpdateMedicineDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  generic?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

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

  // Note: discountedPrice is a computed getter and cannot be updated directly
  // The discountedPrice will be calculated automatically based on isDiscounted and discountPercent
}

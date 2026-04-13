export declare class CreateMedicineDto {
    name: string;
    generic: string;
    barcode: string;
    brand: string;
    price: number;
    stockQuantity: number;
    isDiscounted?: boolean;
    discountPercent?: number;
    imageUrl?: string;
}

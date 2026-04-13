export declare class Medicine {
    id: number;
    name: string;
    generic: string;
    barcode: string;
    brand: string;
    price: number;
    stockQuantity: number;
    isDiscounted: boolean;
    discountPercent: number;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    get isInStock(): boolean;
    get discountedPrice(): number;
}

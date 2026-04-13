export declare enum CustomerType {
    INDIVIDUAL = "individual",
    BUSINESS = "business"
}
export declare class Customer {
    id?: number;
    type?: CustomerType;
    title?: string;
    name?: string;
    displayName?: string;
    phone?: string;
    email?: string;
    billingAddress?: string;
    createdAt?: Date;
}

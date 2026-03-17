export interface Vendor {
    id: string;
    name: string;
    city: string;
    country: string;
    isOpenNow: boolean;
    averagePriceEur?: number;
    standImageUrl: string;
    sinceYear?: number;
    specialty?: string;
}
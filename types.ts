export interface Vendor {
    id: string;
    name: string;
    city: string;
    country: string;
    isOpenNow: boolean;
    averagePriceEur: number;
    standImageUrl: string;
    sinceYear: number;
    specialty: string;
}

export interface StreetFood {
    id: string;
    name: string;
    description: string;
    spiceLevel: number;
    isPopular: boolean;
    firstServedDate: string;
    imageUrl: string;
    category: string;
    priceTier: string;
    tags: string[];
    vendor: Vendor;
}
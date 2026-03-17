import { Vendor } from './Vendor';

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
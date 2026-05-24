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

import { ObjectId } from "mongodb";

/* MongoDB-document voor Gebruiker */
export interface User {
    _id?: ObjectId;
    username: string;
    password?: string; // Optioneel ~ Delete na log-in
    role: "ADMIN" | "USER"; // Rolbepaling
}

/* Tijdelijke opslag fout- en succesmeldingen ~ weergave na redirect */
export interface FlashMessage {
    type: "error" | "success" | "info";
    message: string;
}
import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import { StreetFood, Vendor } from "./types";

dotenv.config();

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);
const db = client.db("urbantaste");

let streetfoodsCol: Collection<StreetFood>;
let vendorsCol: Collection<Vendor>;

async function seedIfEmpty(): Promise<void> {
    const sfCount = await streetfoodsCol.countDocuments();
    if (sfCount === 0) {
        const response = await fetch("https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/streetfoods.json");
        const data: StreetFood[] = await response.json();
        await streetfoodsCol.insertMany(data);
        console.log(`${data.length} streetfoods in database geladen.`);
    }

    const vCount = await vendorsCol.countDocuments();
    if (vCount === 0) {
        const response = await fetch("https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/vendors.json");
        const data: Vendor[] = await response.json();
        await vendorsCol.insertMany(data);
        console.log(`${data.length} vendors in database geladen.`);
    }
}

export async function connect(): Promise<void> {
    await client.connect();
    streetfoodsCol = db.collection<StreetFood>("streetfoods");
    vendorsCol = db.collection<Vendor>("vendors");
    await seedIfEmpty();

    process.on("SIGINT", async () => {
        await client.close();
        process.exit();
    });
}

export async function getStreetFoods(): Promise<StreetFood[]> {
    return streetfoodsCol.find({}).toArray() as unknown as StreetFood[];
}

export async function getStreetFoodById(id: string): Promise<StreetFood | null> {
    return streetfoodsCol.findOne({ id }) as unknown as StreetFood | null;
}

export async function getVendors(): Promise<Vendor[]> {
    return vendorsCol.find({}).toArray() as unknown as Vendor[];
}

export async function getVendorById(id: string): Promise<Vendor | null> {
    return vendorsCol.findOne({ id }) as unknown as Vendor | null;
}

export async function updateStreetFood(id: string, updates: Partial<StreetFood>): Promise<void> {
    await streetfoodsCol.updateOne({ id }, { $set: updates });
}
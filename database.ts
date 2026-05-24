import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import { StreetFood, Vendor, User } from "./types";
import bcrypt from "bcrypt";

dotenv.config();

/* Exporteer data */
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(MONGODB_URI);
const db = client.db("urbantaste");

/* Initialisatie na connect() */
let streetfoodsCol: Collection<StreetFood>;
let vendorsCol: Collection<Vendor>;

/* Nodig door session.ts vóór connect() */
export const userCollection = db.collection<User>("users");

/* Meer rounds = veiliger maar trager */
const saltRounds: number = 10;

async function seedIfEmpty(): Promise<void> {
    const sfCount = await streetfoodsCol.countDocuments();
    if (sfCount === 0) {
        /* Eerste opstart ~ Laad data vanuit GitHub */
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

async function createInitialUsers(): Promise<void> {
    /* Voorkomt duplicaten bij herstart */
    if (await userCollection.countDocuments() > 0) return;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const userUsername  = process.env.USER_USERNAME;
    const userPassword  = process.env.USER_PASSWORD;

    /* Check */
    if (!adminUsername || !adminPassword || !userUsername || !userPassword) {
        throw new Error("ADMIN_USERNAME, ADMIN_PASSWORD, USER_USERNAME en USER_PASSWORD moeten in .env staan");
    }

    await userCollection.insertMany([
        {
            username: adminUsername,
            password: await bcrypt.hash(adminPassword, saltRounds), // Nooit als leesbare tekst opslaan
            role: "ADMIN"
        },
        {
            username: userUsername,
            password: await bcrypt.hash(userPassword, saltRounds),
            role: "USER"
        }
    ]);

    console.log("Standaardgebruikers aangemaakt.");
}

export async function login(username: string, password: string): Promise<User> {
    if (username === "" || password === "") {
        throw new Error("Gebruikersnaam en wachtwoord zijn verplicht");
    }

    const user = await userCollection.findOne<User>({ username });
    if (!user) throw new Error("Gebruiker niet gevonden");

    /* Vergelijkt ingegeven wachtwoord met hash in DB */
    const match = await bcrypt.compare(password, user.password!);
    if (!match) throw new Error("Wachtwoord incorrect");

    return user;
}

export async function register(username: string, password: string): Promise<void> {
    if (username === "" || password === "") {
        throw new Error("Gebruikersnaam en wachtwoord zijn verplicht");
    }

    /* Controleer vóór aanmaken ~ Voorkomt duplicaten */
    const existing = await userCollection.findOne({ username });
    if (existing) throw new Error("Gebruikersnaam bestaat al");

    await userCollection.insertOne({
        username,
        password: await bcrypt.hash(password, saltRounds),
        role: "USER" // Nieuwe gebruikers krijgen altijd USER
    });
}

export async function connect(): Promise<void> {
    await client.connect();
    streetfoodsCol = db.collection<StreetFood>("streetfoods");
    vendorsCol     = db.collection<Vendor>("vendors");

    await seedIfEmpty();
    await createInitialUsers();

    /* Nette afsluiting bij Ctrl+C */
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
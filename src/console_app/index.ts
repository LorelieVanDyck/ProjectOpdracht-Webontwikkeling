// Toepassen 'readline-sync'
import * as readline from 'readline-sync';

// Importeren interfaces
import { StreetFood, Vendor } from '../interfaces';

import fs from 'fs';

// Inlezen JSONS
const streetFoods: StreetFood[] = JSON.parse(
    fs.readFileSync("../jsons/streetfoods.json", "utf-8")
);

const vendors: Vendor[] = JSON.parse(
    fs.readFileSync("../jsons/vendors.json", "utf-8")
);

// Console App
let running: boolean = true;

const menu: string[] = ["View all data", "Filter by ID", "Exit"];

do {
    console.log(`Welcome to the JSON data viewer!`);
    const choiceMenu: number = readline.keyInSelect(menu, `Please enter your choice: `, {cancel: false});

    switch (choiceMenu) {

        /* View all data */
        case 0:
            console.log();
            for (let streetFood of streetFoods) {
                console.log(`- ${streetFood.name} (${streetFood.id})`);
            }
            console.log();
            break;

        /* Filter by ID */
        case 1:
            let found : boolean = false;
            while (!found) {
                const choiceId: string = readline.question(`Please enter the ID you want to filter by (FOOD-001 - FOOD-020): `);
                for (let streetFood of streetFoods) {
                    if (streetFood.id === choiceId.toUpperCase()) {
                        console.log(`\n- ${streetFood.name} (${streetFood.id})`);
                        console.log(`   - Description: ${streetFood.description}`);
                        console.log(`   - Spice Level: ${streetFood.spiceLevel}`);
                        console.log(`   - Popularity: ${streetFood.isPopular}`);
                        console.log(`   - First Served Date: ${streetFood.firstServedDate}`);
                        console.log(`   - Image Food: ${streetFood.imageUrl}`);
                        console.log(`   - Category: ${streetFood.category}`);
                        console.log(`   - Price Tier: ${streetFood.priceTier} of €€€`);
                        console.log(`   - Tags: ${streetFood.tags.join(', ')}`);
                        console.log(`   - Vendor: ${streetFood.vendor.name}`);
                        console.log(`      - Id: ${streetFood.vendor.id}`);
                        console.log(`      - City: ${streetFood.vendor.city}`);
                        console.log(`      - Country: ${streetFood.vendor.country}`);
                        console.log(`      - Image Stand: ${streetFood.vendor.standImageUrl}`);
                        console.log(`      - Open: ${streetFood.vendor.isOpenNow}\n`);

                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.log(`\nGeen streetfood gevonden met dat ID. Probeer het opnieuw!\n`);
                }
            }
            break;

        /* Exit */
        case 2:
            console.log(`\nTot de volgende keer!\n`);
            running = false;
            break;    
    }   

} while (running)

export {}
// Aanpassing package.json
// "start": "ts-node src/app.ts" i.p.v. "start": "ts-node index.ts"

// Toepassen 'readline-sync'
import * as readline from 'readline-sync';

// Importeren interfaces
import { Vendor } from './types';
import { StreetFood } from './types';

async function main() {
    // Jsons ophalen (raw url)
    const vendorResponse = await fetch(`https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/vendors.json`);
    const vendors: Vendor[] = await vendorResponse.json();

    const streetFoodResponse = await fetch(`https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/streetfoods.json`);
    const streetFoods: StreetFood[] = await streetFoodResponse.json();

    let running: boolean = true;
    const menu: string[] = ["View all data 'Streetfoods'", "View all data 'Vendors'", "Filter by ID 'Streetfoods'", "Filter by ID 'Vendors'", "Exit"];

    // Menu loop
    do {
        console.log(`Welcome to the JSON data viewer!`);
        const choiceMenu: number = readline.keyInSelect(menu, `Please enter your choice: `, {cancel: false});
        
        let found : boolean = false;
        switch (choiceMenu) {
    
            /* View all data 'Streetfood' */
            case 0:
                console.log();
                for (const streetFood of streetFoods) {
                    console.log(`- ${streetFood.name} (${streetFood.id})`);
                }
                console.log();
                break;

            /* View all data 'Vendors' */
            case 1:
                console.log();
                for (const vendor of vendors) {
                    console.log(`- ${vendor.name} (${vendor.id})`);
                }
                console.log();
                break;

            /* Filter by ID 'Streetfoods' */
            case 2:
                while (!found) {
                    const choiceId: string = readline.question(`Please enter the ID you want to filter by (FOOD-001 - FOOD-020): `);
                    //Als er niet wordt gevonden = undefined
                    const streetFood = streetFoods.find(sf => sf.id === choiceId.toLocaleUpperCase());
                    
                    if (streetFood) {
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
                    } else {
                        console.log(`\nNo 'Streetfood' found with that ID. Please try again!\n`);
                    }
                }
                break;
            
            /* Filter by ID 'Vendors' */
            case 3:
                while (!found) {
                    const choiceId: string = readline.question(`Please enter the ID you want to filter by (VEN-MX-001 - VEN-VE-002): `);
                    // Als er niets wordt gevonden = undefined
                    const vendor = vendors.find(v => v.id === choiceId.toLocaleUpperCase());
                    
                    if (vendor) {
                        console.log(`\n- ${vendor.name} (${vendor.id})`);
                        console.log(`   - City: ${vendor.city}`);
                        console.log(`   - Country: ${vendor.country}`);
                        console.log(`   - Open or Closed: ${vendor.isOpenNow}`);
                        console.log(`   - Average Price in Euro: ${vendor.averagePriceEur}`);
                        console.log(`   - Image Vendor: ${vendor.standImageUrl}`);
                        console.log(`   - Since Year: ${vendor.sinceYear}`);
                        console.log(`   - Specialty: ${vendor.specialty}\n`);
                
                        found = true;
                        break;
                    } else {
                        console.log(`\nNo 'Vendor' found with that ID. Please try again!\n`);
                        return;
                    }
                }
                break;
    
            /* Exit */
            case 4:
                console.log(`\nSee you next time!\n`);
                running = false;
                break;    
        }   
    
    } while (running)
}
main()

export {}
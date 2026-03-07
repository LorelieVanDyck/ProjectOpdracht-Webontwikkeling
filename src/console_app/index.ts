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
    const choice: number = readline.keyInSelect(menu, `Please enter your choice: `, {cancel: false});

    switch (choice) {

        /* View all data */
        case 0:
            break;

        /* Filter by ID */
        case 1:
            break;

        /* Exit */
        case 2:
            running = false;
            break;    
    }

} while (running)

export {}
import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

/* Import Interfaces */
import { Vendor, StreetFood } from "./types";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

/* Data Ophalen */
/* Interface 'StreetFood' */
async function fetchStreetFood() : Promise<StreetFood[]> {
    const response = await fetch("https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/streetfoods.json");
    const data : StreetFood[] = await response.json();
    return data;
};

/* Interface 'Vendor' */
async function fetchVendors() : Promise<Vendor[]> {
    const response = await fetch("https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/vendors.json");
    const data : Vendor[] = await response.json();
    return data;
};

/* Helper Functie */
function normalizeString(normalString: string): string {
    return normalString
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // wegwerken van accenten
        .trim();
};


/* ---------------- HOME ---------------- */
app.get("/", (req, res) => {
    res.render("home", {
        title: "Home", // Dynamische Titel
        showSearch: false // Dynamische Search
    });
});


/* ---------------- STREETFOODS LIST ----------------- */
app.get("/streetfoods", async (req, res) => {

    // Haalt alle streetfoods op uit API/JSON
    const streetfoods = await fetchStreetFood();
   
    /* =========================
       🔍 1. SEARCH
    ========================= */
    // Zoekterm uit URL (?search_bar=...)
    // undefined → "" zodat code niet breekt
    // lowercase + trim = niet hoofdlettergevoelig + geen spaties
    const search = (req.query.search_bar as string || "")
        .toLowerCase()
        .trim();

    /* =========================
       🔎 2. FILTER LOGICA
    ========================= */
    const normalizeSearch = normalizeString(search);
    const searchNoSpaces = normalizeSearch.replace(/\s+/g, "");
    
    // Als er search is → filter op naam
    // Anders → toon alles
    const filteredStreetFoods = search
        ? streetfoods.filter(food => {
            const normalizedName = normalizeString(food.name);
            const nameNoSpaces = normalizedName.replace(/\s+/g, "");
            return normalizedName.includes(normalizeSearch) || nameNoSpaces.includes(searchNoSpaces);
        })
        : streetfoods;

    /* =========================
       📉 3. NO RESULTS CHECK
    ========================= */
    // Alleen true als:
    // - er een search was
    // - en geen resultaten gevonden zijn
    const noResults = search !== "" && filteredStreetFoods.length === 0;

    /* =========================
       📊 4. SORT INPUT
    ========================= */
    // Welke kolom wordt gesorteerd (name, category, priceTier, spiceLevel)
    const sortField = typeof req.query.sortField === "string"
        ? req.query.sortField
        : "name";

    // Sort richting (asc / desc)
    const sortDirection = typeof req.query.sortDirection === "string"
        ? req.query.sortDirection
        : "asc";

    /* =========================
       💰 5. PRICE HELPER FUNCTION
    ========================= */
    // Zet "€€€" om naar een getal zodat we kunnen sorteren
    const priceValue = (p: string): number => {

        // "€"   → 1
        // "€€"  → 2
        // "€€€" → 3
        return p.length;
    };

    /* =========================
       🔥 6. SORT LOGICA
    ========================= */
    const sortedStreetFoods = [...filteredStreetFoods].sort((a, b) => {

        // SORT OP NAAM (A-Z)
        if (sortField === "name") {
            return sortDirection === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }

        // SORT OP CATEGORY (A-Z)
        if (sortField === "category") {
            return sortDirection === "asc"
                ? a.category.localeCompare(b.category)
                : b.category.localeCompare(a.category);
        }

        // SORT OP PRICE (€/€€/€€€)
        if (sortField === "priceTier") {
            return sortDirection === "asc"
                ? priceValue(a.priceTier) - priceValue(b.priceTier)
                : priceValue(b.priceTier) - priceValue(a.priceTier);
        }

        // SORT OP SPICE LEVEL (numeriek)
        if (sortField === "spiceLevel") {
            return sortDirection === "asc"
                ? a.spiceLevel - b.spiceLevel
                : b.spiceLevel - a.spiceLevel;
        }

        // Fallback (geen sort)
        return 0;
    });

    /* =========================
       📋 7. SORT
    ========================= */

    // Dropdown opties voor sorteren in frontend
    const sortFields = [
        { value: "name", text: "Naam" },
        { value: "category", text: "Categorie" },
        { value: "priceTier", text: "Prijs" },
        { value: "spiceLevel", text: "Spice Level" }
    ];

    /* =========================
       🌐 8. RENDER
    ========================= */
    res.render("streetfoods", {

        streetfoods: sortedStreetFoods, // Uiteindelijke data

        search, // Zoekterm doorgeven
        noResults, // Melding als niks gevonden

        sortField, // Actieve sort kolom
        sortDirection, // Asc of desc

        sortFields, // Lijst van sort-opties

        title: "Streetfoods", // Dynamische Titel

        searchAction: "/streetfoods", // Dynamische Search
        showSearch: true, 
        searchPlaceholder: "Zoek een streetfood"
    });
});


/* ---------------- VENDORS LIST ----------------- */
app.get("/vendors", async (req, res) => {

    // Haalt alle vendors op uit je JSON/API
    const vendors = await fetchVendors();
   
    /* =========================
       🔍 1. SEARCH
    ========================= */
    // Haalt zoekterm op uit URL (?search_bar=...)
    // Zet undefined om naar "" en maakt alles lowercase zodat zoeken niet hoofdlettergevoelig is
    const search = (req.query.search_bar as string || "")
        .toLowerCase()
        .trim();

    /* =========================
       🌍 2. FILTERS
    ========================= */
    // Filter op stad (dropdown)
    const cityFilter = (req.query.cityFilter as string || "").trim();

    // Filter op land (dropdown)
    const countryFilter = (req.query.countryFilter as string || "").trim();

    /* =========================
       📊 3. SORT INPUT
    ========================= */
    // Welke kolom wordt gesorteerd (bv. name, price)
    const sortField = typeof req.query.sortField === "string"
        ? req.query.sortField
        : "name"; // default sort = naam

    // Welke richting (asc = A-Z, desc = Z-A)
    const sortDirection = typeof req.query.sortDirection === "string"
        ? req.query.sortDirection
        : "asc"; // default = oplopend

    /* =========================
       🌐 4. DROPDOWNS DATA
    ========================= */
    // Alle unieke steden uit vendors halen
    const allCities = [...new Set(vendors.map(v => v.city))].sort();

    // Alle unieke landen uit vendors halen
    const allCountries = [...new Set(vendors.map(v => v.country))].sort();

    /* =========================
       🔎 5. FILTER LOGICA
    ========================= */
    const normalizedSearch = normalizeString(search);
    const searchNoSpaces = normalizedSearch.replace(/\s+/g, "");
    
    // Start met alle vendors
    let filteredVendors = vendors;

    // Filter op naam (search bar), aangepast op volledige search
    if (search) {
        filteredVendors = filteredVendors.filter(v => {
            const normalizedName = normalizeString(v.name);
            const nameNoSpaces = normalizedName.replace(/\s+/g, "");
            return normalizedName.includes(normalizedSearch) || nameNoSpaces.includes(searchNoSpaces);
        });
    }

    // Filter op city dropdown
    if (cityFilter) {
        filteredVendors = filteredVendors.filter(v =>
            v.city === cityFilter
        );
    }

    // Filter op country dropdown
    if (countryFilter) {
        filteredVendors = filteredVendors.filter(v =>
            v.country === countryFilter
        );
    }

    /* =========================
       📉 6. NO RESULTS CHECK
    ========================= */
    // Checkt of er filters/search actief zijn én geen resultaten
    const noResults =
        (search !== "" || cityFilter !== "" || countryFilter !== "")
        && filteredVendors.length === 0;

    /* =========================
       🔥 7. SORT LOGICA
    ========================= */
    // Sorteert de gefilterde vendors
    const sortedVendors = [...filteredVendors].sort((a, b) => {

        // SORT OP NAAM (string vergelijking)
        if (sortField === "name") {
            return sortDirection === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }

        // SORT OP PRIJS (nummer vergelijking)
        if (sortField === "averagePriceEur") {
            return sortDirection === "asc"
                ? (a.averagePriceEur || 0) - (b.averagePriceEur || 0)
                : (b.averagePriceEur || 0) - (a.averagePriceEur || 0);
        }

        // Fallback (geen sort)
        return 0;
    });

    /* =========================
       📋 7B. SORT
    ========================= */
    // Lijst van sorteeropties voor dropdown in EJS
    let sortFields = [
        { value: "name", text: "Naam" },
        { value: "averagePriceEur", text: "Gemiddelde Kostprijs" }
    ];

    /* =========================
       🌐 8. RENDER
    ========================= */
    res.render("vendors", {

        vendors: sortedVendors, // Uiteindelijke data

        search, // Zoekterm doorgeven
        noResults, // Melding als niks gevonden

        sortField, // Actieve sort kolom
        sortDirection, // Asc of desc

        sortFields, // Lijst van sort-opties

        cityFilter, // Actieve city filter
        countryFilter, // Actieve country filter

        allCities, // Dropdown data
        allCountries, // Dropdown data

        title: "Vendors", // Dynamische Titel

        searchAction: "/vendors", // Dynamische Search
        showSearch: true,
        searchPlaceholder: "Zoek een vendor"
    });
});


/* ---------------- STREETFOOD DETAIL ---------------- */
app.get("/streetfoods/:id", async(req, res) => {
    const streetfoods = await fetchStreetFood();

    const id = req.params.id;

    const streetfood = streetfoods.find(f => f.id === id);

    if (!streetfood) {
        return res.status(404).render("page_404", {
            title: "Not Found" // Nodig voor dynamische titel
        });
    }

    /* Volledige vendor ophalen uit vendors.json */
    const vendors = await fetchVendors();
    const fullVendor = vendors.find(v => v.id === streetfood.vendor.id);

    /* Andere streetfoods van dezelfde vendor */
    const sameVendorFoods = streetfoods.filter(food =>
        food.vendor.id === streetfood.vendor.id &&
        food.id !== streetfood.id
    );

    res.render("streetfood-detail", {
        streetfood: {
            ...streetfood,          // kopieer alle velden van streetfood (name, description, etc.)
            vendor: fullVendor      // overschrijf vendor met de volledige vendor uit vendors.json
            ?? streetfood.vendor // als fullVendor niet gevonden → gebruik de originele (ingebedde) vendor als fallback
        },
        sameVendorFoods,
        showSearch: false, //showSearch wordt verwacht (toont zoekbar) -> false aanduiden -> anders error
        title: `Streetfood - ${streetfood.name} (#${streetfood.id})` // nodig voor dynamische titel
    });
});


/* ---------------- VENDOR DETAIL ---------------- */
app.get("/vendors/:id", async(req, res) => {
    const vendors = await fetchVendors();

    const id = req.params.id;

    const vendor = vendors.find(v => v.id === id);

    if (!vendor) {
        return res.status(404).render("page_404", {
            title: "Not Found" // Nodig voor dynamische titel
        });
    }

    const streetfoods = await fetchStreetFood();
    const vendorFoods = streetfoods.filter(food => food.vendor.id === vendor.id);

    res.render("vendor-detail", {
        vendor,
        vendorFoods,
        showSearch: false, //showSearch wordt verwacht (toont zoekbar) -> false aanduiden -> anders error
        title: `Vendor - ${vendor.name} (#${vendor.id})` // Nodig voor dynamische titel
    });
});


/* ---------------- START SERVER ---------------- */
app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});
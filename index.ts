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

/* ---------------- HOME ---------------- */
app.get("/", (req, res) => {
    res.render("home", {
        title: "Home" /* Nodig voor dynamische titel */
    });
});

/* ---------------- STREETFOODS LIST ---------------- */
/* Overzichtspagina 'Streetfoods' met 'search-function' */
app.get("/streetfoods", async (req, res) => {
    const streetfoods = await fetchStreetFood();
   
    // 'search' wordt altijd een string:
    // - undefined of geen input → ""
    // - trim() verwijdert spaties
    const search = (req.query.search_bar as string || "").toLowerCase().trim();

    // filter enkel als er effectief gezocht is
    // anders toon je gewoon alle streetfoods
    const filteredStreetFoods = search 
        ? streetfoods.filter(food => 
            food.name.toLowerCase().includes(search))
        : streetfoods
    ;

    // 'noResults' is enkel true als:
    // 1. er een echte search is uitgevoerd (search !== "")
    // 2. en er geen resultaten zijn gevonden
    // → voorkomt foutieve "No results" bij lege zoekbalk
    const noResults = search !== "" && filteredStreetFoods.length === 0;


    /* Onderdeel Sorteren */
    const sortField = typeof req.query.sortField === "string"
            ? req.query.sortField
            : "name"
    ;

    const sortDirection = typeof req.query.sortDirection === "string"
            ? req.query.sortDirection
            : "asc"
    ;

    /* ASC & DESC */
    let sortedStreetFoods = [...filteredStreetFoods].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortField === "category") {
            return sortDirection ==  "asc"
                ? a.category.localeCompare(b.category)
                : b.category.localeCompare(a.category);
        } else if (sortField === "priceTier") {
            return sortDirection === "asc"
                ? a.priceTier.localeCompare(b.priceTier)
                : b.priceTier.localeCompare(a.priceTier);
        } else if (sortField === "spiceLevel") {
            return sortDirection === "asc"
                ? a.spiceLevel - b.spiceLevel
                : b.spiceLevel - a.spiceLevel;
        }  else {
            return 0;
        }
    });

    let sortFields = [
        { value: "name", text: "Naam" },
        { value: "category", text: "Categorie" },
        { value: "priceTier", text: "Prijs" },
        { value: "spiceLevel", text: "Spice Level" }
    ];
       
    res.render("streetfoods", {
       streetfoods: sortedStreetFoods, 
       // Langere notatie => search: search
       search,
       noResults,
       sortField,
       sortDirection,
       sortFields,
       title: "Streetfoods", /* Dynamische Titel */
       searchAction: "/streetfoods" /* Dynamische Search */
    });
});

/* ---------------- VENDORS LIST ---------------- */
/* Overzichtspagina 'Vendors' met 'search-function' */
app.get("/vendors", async (req, res) => {
    const vendors = await fetchVendors();
   
    // 'search' wordt altijd een string:
    // - undefined of geen input → ""
    // - trim() verwijdert spaties
    const search = (req.query.search_bar as string || "").toLowerCase().trim();

    // filter enkel als er effectief gezocht is
    // anders toon je gewoon alle streetfoods
    const filteredVendors = search 
        ? vendors.filter(vendor => 
            vendor.name.toLowerCase().includes(search))
        : vendors
    ;

    // 'noResults' is enkel true als:
    // 1. er een echte search is uitgevoerd (search !== "")
    // 2. en er geen resultaten zijn gevonden
    // → voorkomt foutieve "No results" bij lege zoekbalk
    const noResults = search !== "" && filteredVendors.length === 0;

    res.render("vendors", {
       vendors: filteredVendors, 
       // Langere notatie => search: search
       search,
       noResults,
       title: "Vendors", /* Dynamische Titel */
       searchAction: "/vendors" /* Dynamische Search */
    });
});

/* ---------------- STREETFOOD DETAIL ---------------- */
app.get("/streetfoods/:id", async(req, res) => {
    const streetfoods = await fetchStreetFood();

    const id = req.params.id;

    const streetfood = streetfoods.find(f => f.id === id);

    if (!streetfood) {
        return res.status(404).render("page_404", {
            title: "Not Found" /* Nodig voor dynamische titel */
        });
    }

    res.render("streetfood-detail", {
        streetfood,
        title: `Streetfood - ${streetfood.name} (#${streetfood.id})` /* nodig voor dynamische titel */
    });
});

/* ---------------- VENDOR DETAIL ---------------- */
app.get("/vendors/:id", async(req, res) => {
    const vendors = await fetchVendors();

    const id = req.params.id;

    const vendor = vendors.find(v => v.id === id);

    if (!vendor) {
        return res.status(404).render("page_404", {
            title: "Not Found" /* Nodig voor dynamische titel */
        });
    }

    res.render("vendor-detail", {
        vendor,
        title: `Vendor - ${vendor.name} (#${vendor.id})` /* Nodig voor dynamische titel */
    });
});

/* ---------------- START SERVER ---------------- */
app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});
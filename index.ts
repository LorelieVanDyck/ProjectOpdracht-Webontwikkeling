import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

/* Import interfaces */
import { Vendor, StreetFood } from "./types";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);


/* Data ophalen uit JSON met interface 'StreetFood' */
async function fetchStreetFood() : Promise<StreetFood[]> {
    const response = await fetch("https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/streetfoods.json");
    const data : StreetFood[] = await response.json();
    return data;
};

/* Data ophalen uit JSON met interface 'Vendor' */
async function fetchVendors() : Promise<Vendor[]> {
    const response = await fetch("https://raw.githubusercontent.com/LorelieVanDyck/Projectopdracht-Webontwikkeling_Jsons/refs/heads/main/jsons/vendors.json");
    const data : Vendor[] = await response.json();
    return data;
};


/* Startpagina 'Home' */
app.get("/", (req, res) => {
    res.render("home");
});


/* Overzichtspagina 'Streetfoods' met 'search-function' */
app.get("/streetfoods", async (req, res) => {
    const streetfoods = await fetchStreetFood();
   
    // 'search' wordt altijd een string:
    // - undefined of geen input → ""
    // - trim() verwijdert spaties
    const search = (req.query.q as string || "").toLowerCase().trim();

    // filter enkel als er effectief gezocht is
    // anders toon je gewoon alle streetfoods
    const filteredStreetFoods = search 
        ? streetfoods.filter(streetfoods => 
            streetfoods.name.toLowerCase().includes(search))
        : streetfoods
    ;

    // 'noResults' is enkel true als:
    // 1. er een echte search is uitgevoerd (search !== "")
    // 2. en er geen resultaten zijn gevonden
    // → voorkomt foutieve "No results" bij lege zoekbalk
    const noResults = search !== "" && filteredStreetFoods.length === 0;

    res.render("streetfoods", {
       streetfoods: filteredStreetFoods, 
       // Langere notatie => search: search
       search,
       noResults
    });
});

/* Overzichtspagina 'Vendors' met 'search-function' */
app.get("/vendors", async (req, res) => {
    const vendors = await fetchVendors();
   
    // 'search' wordt altijd een string:
    // - undefined of geen input → ""
    // - trim() verwijdert spaties
    const search = (req.query.q as string || "").toLowerCase().trim();

    // filter enkel als er effectief gezocht is
    // anders toon je gewoon alle streetfoods
    const filteredVendors = search 
        ? vendors.filter(vendors => 
            vendors.name.toLowerCase().includes(search))
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
       noResults
    });
});


/* Detailpagina 'Streetfoods' */
app.get("/streetfoods/:id", async(req, res) => {
    const streetfoods = await fetchStreetFood();

    const id = req.params.id;

    const filteredStreetFoods = streetfoods.find(streetfoods => streetfoods.id === id);

    if (!filteredStreetFoods) {
        return res.status(404).render("page_404");
    }

    res.render("streetfood-detail", {
        filteredStreetFoods
    });
});

/* Detailpagina 'Vendors' */
app.get("/vendors/:id", async(req, res) => {
    const vendors = await fetchVendors();

    const id = req.params.id;

    const filteredVendors = vendors.find(vendors => vendors.id === id);

    if (!filteredVendors) {
        return res.status(404).render("page_404");
    }

    res.render("streetfood-detail", {
        filteredVendors
    });
});

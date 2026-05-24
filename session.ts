// npm uninstall connect-mongodb-session @types/connect-mongodb-session
// npm install connect-mongo

import { MONGODB_URI } from "./database";
import session from "express-session";
import { FlashMessage, User } from "./types";
import MongoStore from "connect-mongo";

/* Sessies in MongoDB ~ Blijven bestaan na herstart */
const mongoStore = MongoStore.create({
    mongoUrl: MONGODB_URI,
    dbName: "urbantaste",
    collectionName: "sessions"
});

mongoStore.on("error", (error) => {
    console.error(error);
});

/* TypeScript-uitbreiding ~ Maakt req.session.user en req.session.message beschikbaar */
declare module "express-session" {
    export interface SessionData {
        user?: User;
        message?: FlashMessage;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "geheime-sleutel", // Ondertekent de sessie-cookie
    store: mongoStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
});
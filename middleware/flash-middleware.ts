import { NextFunction, Request, Response } from "express";

/* Verplaatst flashbericht van sessie naar res.locals ~ Eenmalig tonen na redirect */
export function flashMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message; // Verwijderen ~ Voorkomt herhaling op volgende pagina
    } else {
        res.locals.message = undefined; // Altijd definiëren ~ Voorkomt crash in header.ejs
    }
    next();
}
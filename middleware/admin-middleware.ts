import { NextFunction, Request, Response } from "express";

/* Vereist ADMIN-rol ~ Altijd na secureMiddleware gebruiken */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    if (res.locals.user?.role === "ADMIN") {
        next();
    } else {
        res.status(403).redirect("/"); // USER geblokkeerd ~ Terug naar home
    }
}
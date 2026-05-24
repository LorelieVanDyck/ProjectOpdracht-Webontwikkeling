import { NextFunction, Request, Response } from "express";

/* Bewaakt beveiligde routes ~ Redirect naar /login indien niet ingelogd */
export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        res.locals.user = req.session.user; // Beschikbaar in alle EJS-templates via 'user'
        next();
    } else {
        res.redirect("/login");
    }
}
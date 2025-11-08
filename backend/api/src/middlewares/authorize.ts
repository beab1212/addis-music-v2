import { Request, Response, NextFunction } from "express";

export function authorize(allowedRoles: string[]) {
    return (req: Request & { user?: { role?: string } }, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (userRole && allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: "Access denied." });
        }
    };
}

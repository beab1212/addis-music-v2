import { Request, Response, NextFunction } from "express";

export function authorize(allowedRoles: string[] | string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (userRole && (Array.isArray(allowedRoles) ? allowedRoles.includes(userRole) : allowedRoles === userRole)) {
            next();
        } else {
            res.status(403).json({ 
                success: false, 
                message: 'Forbidden: You do not have permission to access this.'
             });
        }
    };
}

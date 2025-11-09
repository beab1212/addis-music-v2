import { success } from "better-auth/*";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export interface AppError extends Error {
    custom?: boolean;
    status?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    // only custom errors are sown to the users
    if (err?.custom) {
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal Server Error'
        });
    }
    
    // zod validation error
    if (err instanceof z.ZodError) {
        return res.status(400).json({
            success: false,
            message: err.issues.map(i => i.message).join(", ")
        });
    }

    // if not error messages may contain sensitive ifo
    // so we just return 'Internal server error' with 500
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
}

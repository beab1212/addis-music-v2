import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
    custom?: boolean;
    status?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    // only custom errors are sown to the users
    if (err?.custom) {
        return res.status(err.status || 500).json({
            message: err.message || 'Internal Server Error'
        });
    }
    
    // if not error messages may contain sensitive ifo
    // so we just return 'Internal server error' with 500
    res.status(500).json({
        message: 'Internal Server Error'
    });
}

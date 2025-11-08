import { Request, Response } from "express";

export const systemController = {
    healthCheck: async(req: Request, res: Response) => {
        res.json({
            status: "ok"
        })
    }
}

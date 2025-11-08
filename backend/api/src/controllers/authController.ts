import type { Request, Response } from 'express';
import { auth } from "../libs/auth";

export const authController = {
    signUpEmail: async (req: Request, res: Response) => {
        const { name,email, password } = req.body;
        const data = await auth.api.signUpEmail({
            body: {
                name, // required
                email, // required
                password, // required
                // image: "https://example.com/image.png",
                callbackURL: "http://localhost:3000/verify",
            },
        });
    },
    
    signInEmail: async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const data = await auth.api.signInEmail({
            body: {
                email: email, // required
                password: password, // required
                rememberMe: true,
                callbackURL: "http://localhost:3000/app",
            },
            // Use the incoming request headers (Express) instead of an undefined headers() helper.
            headers: req.headers as any,
        });
    },

    signoutEmail:  async (req: Request, res: Response) => {
        await auth.api.signOut({
            // This endpoint requires session cookies.
            headers: req.headers as any,
        });
    }
};

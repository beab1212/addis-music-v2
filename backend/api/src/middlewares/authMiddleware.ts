import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../libs/auth";


async function getSession(req: Request) {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    return session;
}

export async function requireAuth(req: Request & { user?: { role?: string } }, res: Response, next: NextFunction) {
    try {
    const session = await getSession(req);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Attach the user to the request object
    req.user = session.user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const paginationSchema = z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(10),
});

export const searchSchema = z.object({
    q: z.string().min(1, "Search query cannot be empty").optional().default(""),
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(10),
});

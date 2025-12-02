import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid UUID format");


export const paginationSchema = z.object({
    page: z.coerce.number() // Automatically converts the string query parameter to a number
        .min(1, { message: "Page must be greater than or equal to 1" })
        .optional()
        .default(1),
        
    limit: z.coerce.number() // Automatically converts the string query parameter to a number
        .min(1, { message: "Limit must be greater than or equal to 1" })
        .max(100, { message: "Limit must be less than or equal to 100" })
        .optional()
        .default(10),
});

export const searchSchema = z.object({
    q: z.string().min(1, "Search query cannot be empty").optional().default(""),
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(10),
});

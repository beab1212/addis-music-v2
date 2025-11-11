import { z } from "zod";

export const createArtistSchema = z.object({
    name: z.string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
    bio: z.string()
    .min(5, "Bio must be at least 5 characters")
    .max(500, "Bio must be at most 500 characters")
    .optional(),
    isVerified: z.boolean().optional(),
    
    genres: z.array(z.string().min(2, "Genre must be at least 2 characters").max(30, "Genre must be at most 30 characters")).max(5, "Genres must be at most 5").optional(),
    file: z.any().optional(),
});

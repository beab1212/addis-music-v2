import { z } from "zod";

export const createArtistSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be at most 50 characters"),
    bio: z.string()
        .min(5, "Bio must be at least 5 characters")
        .max(500, "Bio must be at most 500 characters")
        .optional().nullable(),
    isVerified: z
        .union([
            z.literal("true"),    // String literal "true"
            z.literal("false"),   // String literal "false"
            z.boolean(),           // Boolean true/false
        ])
        .transform((val) => {
            if (val === "true") return true;    // Convert "true" string to boolean true
            if (val === "false") return false;  // Convert "false" string to boolean false
            return val === true || val === false ? val : null;  // Return boolean or null
        })
        .optional()  // Optional, so it can be omitted
        .nullable(),

    genres: z.array(z.string().min(2, "Genre must be at least 2 characters").max(30, "Genre must be at most 30 characters")).max(5, "Genres must be at most 5").optional().nullable(),
    file: z.any().optional(),
});

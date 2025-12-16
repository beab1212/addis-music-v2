import { z } from "zod";

export const createPlaylistSchema = z.object({
    title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 50 characters"),
    description: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
    isPublic: z
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
});


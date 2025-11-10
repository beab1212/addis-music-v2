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
    .boolean().default(true)
});


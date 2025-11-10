import { z } from "zod";

export const addItemToPlaylistSchema = z.object({
    trackId: z.string().uuid("Invalid track ID"),
    position: z
    .number()
    .min(0, "Position must be a non-negative integer")
    .max(100, "Position must be less than 100 since playlist items are limited to 100").optional(),
});

export const playlistUuidSchema = z.string().uuid("Invalid playlist ID format");


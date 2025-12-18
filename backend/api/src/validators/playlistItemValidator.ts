import { z } from "zod";

export const addItemToPlaylistSchema = z.object({
    trackId: z.string().uuid("Invalid track ID"),
    position: z
    .number()
    .min(0, "Position must be a non-negative integer")
    .max(100, "Position must be less than 100 since playlist items are limited to 100").optional(),
});

export const addIMultipleTrackPlaylistSchema = z.object({
    trackIds: z.array(z.string().uuid("Invalid track ID")).min(1, "At least one track ID must be provided").max(20, "Cannot add more than 20 tracks at once"),
});

export const playlistUuidSchema = z.string().uuid("Invalid playlist ID format");


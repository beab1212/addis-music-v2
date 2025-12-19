import z from "zod";

export const updateUserProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(30, "First name is too long").optional(),
    lastName: z.string().min(1, "Last name is required").max(30, "Last name is too long").optional(),
    displayName: z.string().min(1, "Display name is required").max(50, "Display name is too long").optional(),
    bio: z.string().max(160, "Bio is too long").optional(),
    country: z.string().max(56, "Country name is too long").optional(),
});

export const updateUserPreferencesSchema = z.object({
    favoriteArtists: z.array(
        z.string().max(10, "Favorite Artists must be max 10 characters")
    ).max(10, "Maximum of 10 favorite artists allowed").optional().default([]),
    favoriteGenres: z.array(
        z.string().max(10, "Favorite Genres must be max 10 characters")
    ).max(10, "Maximum of 10 favorite genres allowed").optional().default([]),
    moodPreference: z.string().max(50, "Mood preference input is too long").optional().default(''),
    language: z.string().max(50, "Language input is too long").optional().default(''),
});

import z from "zod";

export const updateUserProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(30, "First name is too long").optional(),
    lastName: z.string().min(1, "Last name is required").max(30, "Last name is too long").optional(),
    displayName: z.string().min(1, "Display name is required").max(50, "Display name is too long").optional(),
    bio: z.string().max(160, "Bio is too long").optional(),
    country: z.string().max(56, "Country name is too long").optional(),
});

import z from "zod";

export const uploadTrackSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    artistId: z.string().uuid("Artist ID must be a valid UUID"),
    albumId: z.string().nullable().optional(),
    genreId: z.string().uuid("Genre Id must be a valid UUID"),
    tags: z.array(
        z.string().max(30, "Tag is too long")
    ).max(10, "Maximum of 10 tags allowed").optional(),
    releaseDate: z
        .string()
        .min(1, "Release date is required") // ensures field is not empty
        .refine((val) => !isNaN(Date.parse(val)), {
          message: "Release date must be a valid date",
        })
        .transform((val) => new Date(val)).optional().nullable(),
    description: z.string().max(500, "Description must be at most 500 characters").optional().nullable(),
    credit: z.string().max(300, "Credit must be at most 300 characters").optional().nullable(),
});

import z from "zod";

export const uploadTrackSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    artistId: z.string().uuid("Artist ID must be a valid UUID"),
    albumId: z.string().optional(),
    genreId: z.string().uuid("Genre Id must be a valid UUID"),
    tags: z.array(
        z.string().min(1, "Tag must be min 1 character").max(10, "Tag must be max 10 characters")
    ).max(10, "Maximum of 10 tags allowed").optional(),
    releaseDate: z
        .string()
        .min(1, "Release date is required") // ensures field is not empty
        .refine((val) => !isNaN(Date.parse(val)), {
          message: "Release date must be a valid date",
        })
        .transform((val) => new Date(val)).optional(),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
    credit: z.string().max(300, "Credit must be at most 300 characters").optional(),
});

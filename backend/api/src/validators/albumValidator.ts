import { z } from "zod";

export const createAlbumSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  artistId: z.string().uuid("Invalid artist ID"),
  releaseDate: z
    .string()
    .min(1, "Release date is required") // ensures field is not empty
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Release date must be a valid date",
    })
    .transform((val) => new Date(val)), // converts string to Date object
  genreId: z.string().uuid("Invalid genre ID").optional(),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  credit: z.string().max(300, "Credit must be at most 300 characters").optional(),
});

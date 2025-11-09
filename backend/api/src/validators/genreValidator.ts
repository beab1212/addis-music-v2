import { z } from "zod";

export const createGenreSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be under 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
});


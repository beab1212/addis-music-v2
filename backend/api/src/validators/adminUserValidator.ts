import z from "zod";

export const userRole = z.object({
    role: z.enum(['admin', 'user'] as const, {
        error: "Role must be one of 'admin' or 'user'",
    }),
});

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(20, "Password is too long")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain a special character");

export const userSessionSchema = z.object({
    sessionToken: z.string().min(1, "Session token is required").max(255, "Session token is too long"),
});

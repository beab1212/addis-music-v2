import z from "zod";

export const subscriptionSchema = z.object({
  plan: z.enum(["family", "premium", "free"]).describe("Subscription plan"),
  planType: z.enum(["monthly", "quarterly", "annual"]).describe("Payment frequency"),
});

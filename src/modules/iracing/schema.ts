import z from "zod";

export const IracingLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  userId: z.string(),
});

export const customerIdSchema = z.object({
  customerId: z.number(),
});

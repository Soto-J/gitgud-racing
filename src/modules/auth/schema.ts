import { z } from "zod";

export const IRacingLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password required" }),
  userId: z.string().min(1, { message: "Id is required" }),
});

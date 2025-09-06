import z from "zod";
// =============================================================================
// USER DATA SCHEMAS
// =============================================================================

export const IRacingGetUserInputSchema = z.object({
  userId: z.string().min(1, { message: "Id is required" }),
});



// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const IRacingLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password required" }),
  userId: z.string().min(1, { message: "Id is required" }),
});

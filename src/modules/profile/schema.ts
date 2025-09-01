import z from "zod";

// =============================================================================
// PROFILE QUERY SCHEMAS
// =============================================================================

export const GetProfileInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});

// =============================================================================
// PROFILE MANAGEMENT SCHEMAS
// =============================================================================

export const ProfileUpdateDataSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  iRacingId: z.string(),
  discord: z.string(),
  bio: z.string(),
});

export const UpdateProfileInputSchema = ProfileUpdateDataSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});

export const CreateProfileInputSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});
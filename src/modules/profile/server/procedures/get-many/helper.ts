import { db } from "@/db";
import { profileTable } from "@/db/schemas";

/**
 * Fetches all profiles from the database
 */
export async function getAllProfiles() {
  return await db.select().from(profileTable);
}
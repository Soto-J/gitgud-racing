import crypto from "crypto";

/**
 * Masks the iRacing client secret according to their OAuth specification.
 * The masking algorithm:
 * 1. Normalizes the identifier (trim and lowercase)
 * 2. Concatenates secret + normalized_identifier
 * 3. Hashes with SHA-256
 * 4. Returns base64 encoded hash
 *
 * @param secret - The client secret
 * @param identifier - The client_id
 * @returns Base64 encoded SHA-256 hash
 */
export function maskIRacingSecret(secret: string, identifier: string): string {
  const normalizedId = identifier.trim().toLowerCase();

  const combined = secret + normalizedId;

  const hash = crypto.createHash("sha256").update(combined).digest("base64");

  return hash;
}

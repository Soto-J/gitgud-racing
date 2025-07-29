import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import CryptoJS from "crypto-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashIRacingPassword(
  email: string,
  password: string,
): string {
  const hash = CryptoJS.SHA256(password + email.toLowerCase());
  return CryptoJS.enc.Base64.stringify(hash);
}

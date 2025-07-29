import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import CryptoJS from "crypto-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashIRacingPassword(password: string, email: string): string {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.SHA256(password + email.toLowerCase()),
  );
}

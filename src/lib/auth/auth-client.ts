import { createAuthClient } from "better-auth/react";
import { adminClient, genericOAuthClient } from "better-auth/client/plugins";
import env from "@/env";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [adminClient(), genericOAuthClient()],
});

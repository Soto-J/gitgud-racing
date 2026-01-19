import { z, ZodError } from "zod";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

const stringBoolean = z.coerce
  .string()
  .transform((val) => val === "true")
  .pipe(z.boolean())
  .default(false);

const EnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string(),
  DATABASE_URL: z.string(),
  CRON_SECRET: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  IRACING_AUTH_SECRET: z.string(),
  IRACING_CLIENT_ID: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// expand reads your loaded .env object and replaces variable references (${VAR}) with their actual values.
expand(config());

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n";

    error.issues.forEach((issue) => {
      message += String(issue.path[0]) + "\n";
    });

    const e = new Error(message);

    e.stack = "";

    throw e;
  } else {
    console.error(error);
  }
}

export default EnvSchema.parse(process.env);

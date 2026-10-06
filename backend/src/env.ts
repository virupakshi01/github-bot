import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

// dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  MONGODB_URI: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_OAUTH_CALLBACK_URL: z.string().url(),
  SESSION_SECRET: z.string().min(16),
  SLACK_BOT_TOKEN: z.string().optional().default(""),
  SLACK_DEFAULT_CHANNEL: z.string().optional().default("#github-automation"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

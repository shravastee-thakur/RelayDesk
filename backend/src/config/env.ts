import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("8000"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  NODE_ENV: z.enum(["development", "production"]).default("development"),

  HMAC_SECRET: z.string().min(10, "HMAC_SECRET is required and must be secure"),
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),

  IOREDIS_URL: z.string().url("IOREDIS_URL must be a valid URL"),

  BREVO_API_KEY: z.string().min(1),
  SENDER_EMAIL: z.string().email("SENDER_EMAIL must be a valid email address"),

  ACCESS_SECRET: z.string().min(1),
  REFRESH_SECRET: z.string().min(1),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables:");
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;

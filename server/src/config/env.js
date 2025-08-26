import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535))
    .default("5000"),

  MONGODB_URI: z.string().url().describe("MongoDB connection string"),

  JWT_SECRET: z
    .string()
    .min(32)
    .describe("JWT secret key (minimum 32 characters)"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .describe("JWT refresh secret key (minimum 32 characters)"),

  GOOGLE_GENERATIVE_AI_API_KEY: z
    .string()
    .min(1)
    .describe("Google AI API key for embeddings and chat"),

  GOOGLE_CLIENT_ID: z.string().min(1).describe("Google OAuth client ID"),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1)
    .describe("Google OAuth client secret"),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:5000/auth/google/callback"),

  SESSION_SECRET: z
    .string()
    .min(32)
    .describe("Express session secret (minimum 32 characters)"),

  EMAIL_HOST: z.string(),
  EMAIL_PORT: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(1).max(65535)),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string(),
  EMAIL_FROM: z.string(),

  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  MAX_FILE_SIZE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default("10485760"),

  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default("100"),
});

let env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error("Environment validation failed:");

  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error("  -", error.message);
  }

  console.error(
    "\nPlease check your .env file and ensure all required variables are set correctly."
  );
  process.exit(1);
}

console.log("Environment validation passed");

export default env;

export const {
  NODE_ENV,
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  GOOGLE_GENERATIVE_AI_API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  SESSION_SECRET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  CLIENT_URL,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
  CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} = env;

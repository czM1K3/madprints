import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_URL: z.string().url(),
    IMAGE_PREFIX: z.string(),
    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: z.coerce.number(),
    MINIO_USE_SSL: z.string().transform((value) => ["TRUE", "true"].includes(value)),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
    MINIO_BUCKET: z.string(),
    // DISCORD_CLIENT_ID: z.string(),
    // DISCORD_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PER_PAGE: z.coerce.number().default(12),
    NEXT_PUBLIC_URL: z.string().url().nullish(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_USE_SSL: process.env.MINIO_USE_SSL,
    MINIO_BUCKET: process.env.MINIO_BUCKET,
    NEXT_PUBLIC_PER_PAGE: process.env.NEXT_PUBLIC_PER_PAGE,
    IMAGE_PREFIX: process.env.IMAGE_PREFIX,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    // DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    // DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

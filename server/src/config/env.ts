import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().min(1),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  CLIENT_ORIGIN: z
    .string()
    .url()
    .refine((value) => {
      if (!URL.canParse(value)) {
        return false;
      }

      const url = new URL(value);

      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.origin === value
      );
    }, "CLIENT_ORIGIN must be an exact HTTP(S) origin without a path, query, or trailing slash.")
    .optional(),
}).superRefine((values, context) => {
  if (
    values.NODE_ENV === "production" &&
    !values.CLIENT_ORIGIN?.startsWith("https://")
  ) {
    context.addIssue({
      code: "custom",
      path: ["CLIENT_ORIGIN"],
      message: "CLIENT_ORIGIN must be explicitly set to an HTTPS origin in production.",
    });
  }
}).transform((values) => ({
  ...values,
  CLIENT_ORIGIN: values.CLIENT_ORIGIN ?? "http://localhost:5173",
}));

export const env = envSchema.parse(process.env);

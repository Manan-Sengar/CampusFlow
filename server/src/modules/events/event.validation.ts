import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2)
      .max(150),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    venue: z
      .string()
      .trim()
      .max(250)
      .optional(),

    startAt: z.coerce.date(),

    endAt: z.coerce.date(),

    visibility: z
      .enum([
        "PUBLIC",
        "INTERNAL",
      ])
      .default("INTERNAL"),
  })
  .refine(
    (data) =>
      data.endAt > data.startAt,
    {
      message:
        "Event end time must be after the start time.",
      path: ["endAt"],
    },
  );

export const eventIdSchema =
  z.string().uuid();

export type CreateEventInput =
  z.infer<typeof createEventSchema>;
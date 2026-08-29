import { z } from "zod";

const preferenceSchema = z.object({
  teamId: z.string().uuid(),
  rank: z.number().int().positive(),
});

export const createApplicationSchema = z
  .object({
    motivation: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    experience: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    preferences: z
      .array(preferenceSchema)
      .min(1)
      .max(10),
  })
  .superRefine(
    (data, ctx) => {
      const teamIds =
        data.preferences.map(
          (preference) =>
            preference.teamId,
        );

      const ranks =
        data.preferences.map(
          (preference) =>
            preference.rank,
        );

      if (
        new Set(teamIds).size !==
        teamIds.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["preferences"],
          message:
            "The same team cannot be selected more than once.",
        });
      }

      if (
        new Set(ranks).size !==
        ranks.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["preferences"],
          message:
            "Preference ranks must be unique.",
        });
      }
    },
  );

export const updateApplicationSchema = z
  .object({
    motivation: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    experience: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    preferences: z
      .array(preferenceSchema)
      .min(1)
      .max(10)
      .optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        "At least one field must be provided.",
    },
  )
  .superRefine(
    (data, ctx) => {
      if (!data.preferences) {
        return;
      }

      const teamIds =
        data.preferences.map(
          (preference) =>
            preference.teamId,
        );

      const ranks =
        data.preferences.map(
          (preference) =>
            preference.rank,
        );

      if (
        new Set(teamIds).size !==
        teamIds.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["preferences"],
          message:
            "The same team cannot be selected more than once.",
        });
      }

      if (
        new Set(ranks).size !==
        ranks.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["preferences"],
          message:
            "Preference ranks must be unique.",
        });
      }
    },
  );

export const applicationIdSchema =
  z.string().uuid();

export const updateApplicationStatusSchema =
  z.object({
    status: z.enum([
      "UNDER_REVIEW",
      "SHORTLISTED",
      "SELECTED",
      "REJECTED",
    ]),
  });

export type CreateApplicationInput =
  z.infer<
    typeof createApplicationSchema
  >;

export type UpdateApplicationInput =
  z.infer<
    typeof updateApplicationSchema
  >;



  
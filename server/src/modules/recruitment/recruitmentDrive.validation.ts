import { z } from "zod";

export const createRecruitmentDriveSchema =
  z
    .object({
      title: z
        .string()
        .trim()
        .min(3)
        .max(150),

      description: z
        .string()
        .trim()
        .max(2000)
        .optional(),

      opensAt: z.coerce.date(),

      closesAt: z.coerce.date(),
    })
    .refine(
      (data) =>
        data.closesAt >
        data.opensAt,
      {
        message:
          "Recruitment drive closing time must be after its opening time.",
        path: ["closesAt"],
      },
    );

export const recruitmentDriveIdSchema =
  z.string().uuid();

export const updateRecruitmentDriveStatusSchema =
  z.object({
    status: z.enum([
      "OPEN",
      "CLOSED",
      "CANCELLED",
    ]),
  });

export type CreateRecruitmentDriveInput =
  z.infer<
    typeof createRecruitmentDriveSchema
  >;
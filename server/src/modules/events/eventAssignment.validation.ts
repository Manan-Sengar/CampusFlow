import { z } from "zod";

export const createEventAssignmentSchema =
  z.object({
    membershipId: z.string().uuid(),

    type: z
      .enum([
        "COORDINATOR",
        "VOLUNTEER",
      ])
      .default("VOLUNTEER"),

    workingTeamId: z
      .string()
      .uuid()
      .optional(),

    responsibility: z
      .string()
      .trim()
      .max(500)
      .optional(),
  });

export const eventAssignmentIdSchema =
  z.string().uuid();

export const respondToEventAssignmentSchema =
  z.object({
    status: z.enum([
      "ACCEPTED",
      "DECLINED",
    ]),
  });

export type CreateEventAssignmentInput =
  z.infer<
    typeof createEventAssignmentSchema
  >;
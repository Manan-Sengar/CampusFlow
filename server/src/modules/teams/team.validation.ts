import { z } from "zod";

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export type CreateTeamInput =
  z.infer<typeof createTeamSchema>;

export const assignPrimaryTeamSchema = z.object({
  teamId: z.string().uuid(),
});

export type AssignPrimaryTeamInput =
  z.infer<typeof assignPrimaryTeamSchema>;
import { z } from "zod";

export const addMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(255),

  role: z
    .enum(["ADMIN", "LEAD", "MEMBER"])
    .default("MEMBER"),
});

export type AddMemberInput =
  z.infer<typeof addMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "LEAD", "MEMBER"]),
});

export const updateMemberStatusSchema = z.object({
  status: z.enum([
    "ACTIVE",
    "INACTIVE",
    "ALUMNI",
    "REMOVED",
  ]),
});

export type UpdateMemberRoleInput =
  z.infer<typeof updateMemberRoleSchema>;

export type UpdateMemberStatusInput =
  z.infer<typeof updateMemberStatusSchema>;
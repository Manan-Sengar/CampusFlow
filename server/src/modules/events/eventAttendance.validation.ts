import { z } from "zod";

export const markAttendanceSchema =
  z.object({
    status: z.enum([
      "PRESENT",
      "ABSENT",
    ]),
  });

export const attendanceMembershipIdSchema =
  z.string().uuid();
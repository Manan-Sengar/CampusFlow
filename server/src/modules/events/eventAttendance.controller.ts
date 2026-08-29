import type {
  Request,
  Response,
} from "express";

import {
  getEventAttendance,
  markEventAttendance,
} from "./eventAttendance.service.js";

import {
  attendanceMembershipIdSchema,
  markAttendanceSchema,
} from "./eventAttendance.validation.js";

import {
  eventIdSchema,
} from "./event.validation.js";

export async function markAttendance(
  req: Request<{
    clubId: string;
    eventId: string;
    membershipId: string;
  }>,
  res: Response,
) {
  const parsedEventId =
    eventIdSchema.safeParse(
      req.params.eventId,
    );

  const parsedMembershipId =
    attendanceMembershipIdSchema
      .safeParse(
        req.params.membershipId,
      );

  if (
    !parsedEventId.success ||
    !parsedMembershipId.success
  ) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_ATTENDANCE_REQUEST",
        message:
          "Invalid event or membership ID.",
      },
    });
  }

  const parsed =
    markAttendanceSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",
        message:
          "Attendance must be PRESENT or ABSENT.",
      },
    });
  }

  try {
    const result =
      await markEventAttendance(
        req.params.clubId,
        parsedEventId.data,
        parsedMembershipId.data,
        res.locals.clubAccess
          .membershipId,
        parsed.data.status,
      );

    return res.status(200).json(
      result,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "EVENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "EVENT_NOT_FOUND",
          message:
            "Event not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "EVENT_NOT_APPROVED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "EVENT_NOT_APPROVED",
          message:
            "Attendance can only be marked for approved events.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "MEMBERSHIP_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "MEMBERSHIP_NOT_FOUND",
          message:
            "Club membership not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "MEMBERSHIP_NOT_ACTIVE"
    ) {
      return res.status(409).json({
        error: {
          code:
            "MEMBERSHIP_NOT_ACTIVE",
          message:
            "Attendance cannot be marked for an inactive membership.",
        },
      });
    }

    throw error;
  }
}

export async function listAttendance(
  req: Request<{
    clubId: string;
    eventId: string;
  }>,
  res: Response,
) {
  const parsedEventId =
    eventIdSchema.safeParse(
      req.params.eventId,
    );

  if (!parsedEventId.success) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_EVENT_ID",
        message:
          "Invalid event ID.",
      },
    });
  }

  try {
    const attendance =
      await getEventAttendance(
        req.params.clubId,
        parsedEventId.data,
      );

    return res.status(200).json({
      attendance,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "EVENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "EVENT_NOT_FOUND",
          message:
            "Event not found.",
        },
      });
    }

    throw error;
  }
}
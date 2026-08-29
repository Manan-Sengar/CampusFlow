import type {
  Request,
  Response,
} from "express";

import {
  createEventAssignment,
  getEventAssignments,
  respondToEventAssignment,
} from "./eventAssignment.service.js";

import {
  createEventAssignmentSchema,
  eventAssignmentIdSchema,
  respondToEventAssignmentSchema,
} from "./eventAssignment.validation.js";

import {
  eventIdSchema,
} from "./event.validation.js";

export async function addEventAssignment(
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

  const parsed =
    createEventAssignmentSchema
      .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",
        message:
          "Invalid event assignment data.",
        details:
          parsed.error.flatten(),
      },
    });
  }

  try {
    const assignment =
      await createEventAssignment(
        req.params.clubId,
        parsedEventId.data,
        res.locals.clubAccess
          .membershipId,
        parsed.data,
      );

    return res.status(201).json({
      assignment,
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
            "Members can only be assigned to approved events.",
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
            "Only active members can be assigned to events.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "TEAM_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "TEAM_NOT_FOUND",
          message:
            "Working team not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "TEAM_ARCHIVED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "TEAM_ARCHIVED",
          message:
            "An archived team cannot be used as the working team.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "EVENT_ASSIGNMENT_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        error: {
          code:
            "EVENT_ASSIGNMENT_ALREADY_EXISTS",
          message:
            "This member is already assigned to the event.",
        },
      });
    }

    throw error;
  }
}

export async function listEventAssignments(
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
    const assignments =
      await getEventAssignments(
        req.params.clubId,
        parsedEventId.data,
      );

    return res.status(200).json({
      assignments,
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

export async function respondToAssignment(
  req: Request<{
    clubId: string;
    eventId: string;
    assignmentId: string;
  }>,
  res: Response,
) {
  const parsedEventId =
    eventIdSchema.safeParse(
      req.params.eventId,
    );

  const parsedAssignmentId =
    eventAssignmentIdSchema
      .safeParse(
        req.params.assignmentId,
      );

  if (
    !parsedEventId.success ||
    !parsedAssignmentId.success
  ) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_ASSIGNMENT_REQUEST",
        message:
          "Invalid event or assignment ID.",
      },
    });
  }

  const parsed =
    respondToEventAssignmentSchema
      .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",
        message:
          "Assignment response must be ACCEPTED or DECLINED.",
      },
    });
  }

  try {
    const result =
      await respondToEventAssignment(
        req.params.clubId,
        parsedEventId.data,
        parsedAssignmentId.data,
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
            "Assignments cannot be changed for an unapproved event.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "EVENT_ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "EVENT_ASSIGNMENT_NOT_FOUND",
          message:
            "Event assignment not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "EVENT_ASSIGNMENT_FORBIDDEN"
    ) {
      return res.status(403).json({
        error: {
          code:
            "EVENT_ASSIGNMENT_FORBIDDEN",
          message:
            "You can only respond to your own event assignment.",
        },
      });
    }

    throw error;
  }
}
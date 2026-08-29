import type {
  Request,
  Response,
} from "express";

import {
  approveEvent,
  createEvent,
  getEventForClub,
  getEventsForClub,
} from "./event.service.js";

import {
  createEventSchema,
  eventIdSchema,
} from "./event.validation.js";

export async function createClubEvent(
  req: Request<{
    clubId: string;
  }>,
  res: Response,
) {
  const parsed =
    createEventSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",
        message:
          "Invalid event data.",
        details:
          parsed.error.flatten(),
      },
    });
  }

  const clubAccess =
    res.locals.clubAccess;

  const event =
    await createEvent(
      req.params.clubId,
      clubAccess.membershipId,
      clubAccess.role,
      parsed.data,
    );

  return res.status(201).json({
    event,
  });
}

export async function listClubEvents(
  req: Request<{
    clubId: string;
  }>,
  res: Response,
) {
  const clubEvents =
    await getEventsForClub(
      req.params.clubId,
    );

  return res.status(200).json({
    events: clubEvents,
  });
}

export async function getClubEvent(
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

  const event =
    await getEventForClub(
      req.params.clubId,
      parsedEventId.data,
    );

  if (!event) {
    return res.status(404).json({
      error: {
        code:
          "EVENT_NOT_FOUND",
        message:
          "Event not found.",
      },
    });
  }

  return res.status(200).json({
    event,
  });
}

export async function approveClubEvent(
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
    const result =
      await approveEvent(
        req.params.clubId,
        parsedEventId.data,
        res.locals.clubAccess
          .membershipId,
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
        "EVENT_CANNOT_BE_APPROVED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "EVENT_CANNOT_BE_APPROVED",
          message:
            "This event cannot be approved in its current state.",
        },
      });
    }

    throw error;
  }
}
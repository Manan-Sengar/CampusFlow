import {
  and,
  desc,
  eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
  events,
} from "../../db/schema/index.js";

import type {
  CreateEventInput,
} from "./event.validation.js";

type CreatorRole =
  | "ADMIN"
  | "LEAD"
  | "MEMBER";

export async function createEvent(
  clubId: string,
  creatorMembershipId: string,
  creatorRole: CreatorRole,
  input: CreateEventInput,
) {
  const now = new Date();

  const isAdmin =
    creatorRole === "ADMIN";

  const [event] = await db
    .insert(events)
    .values({
      clubId,

      title: input.title.trim(),

      description:
        input.description?.trim() ||
        null,

      venue:
        input.venue?.trim() ||
        null,

      startAt: input.startAt,
      endAt: input.endAt,

      visibility:
        input.visibility,

      status: isAdmin
        ? "APPROVED"
        : "PENDING_APPROVAL",

      createdByMembershipId:
        creatorMembershipId,

      approvedByMembershipId:
        isAdmin
          ? creatorMembershipId
          : null,

      approvedAt:
        isAdmin
          ? now
          : null,
    })
    .returning();

  if (!event) {
    throw new Error(
      "EVENT_CREATION_FAILED",
    );
  }

  return event;
}

export async function getEventsForClub(
  clubId: string,
) {
  return db
    .select()
    .from(events)
    .where(
      eq(events.clubId, clubId),
    )
    .orderBy(
      desc(events.startAt),
    );
}

export async function getEventForClub(
  clubId: string,
  eventId: string,
) {
  const [event] = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.id, eventId),
        eq(events.clubId, clubId),
      ),
    )
    .limit(1);

  return event ?? null;
}

export async function approveEvent(
  clubId: string,
  eventId: string,
  approverMembershipId: string,
) {
  const event =
    await getEventForClub(
      clubId,
      eventId,
    );

  if (!event) {
    throw new Error(
      "EVENT_NOT_FOUND",
    );
  }

  if (
    event.status === "APPROVED"
  ) {
    return {
      event,
      changed: false,
    };
  }

  if (
    event.status !==
    "PENDING_APPROVAL"
  ) {
    throw new Error(
      "EVENT_CANNOT_BE_APPROVED",
    );
  }

  const now = new Date();

  const [updatedEvent] =
    await db
      .update(events)
      .set({
        status: "APPROVED",
        approvedByMembershipId:
          approverMembershipId,
        approvedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(events.id, eventId),
          eq(events.clubId, clubId),
        ),
      )
      .returning();

  if (!updatedEvent) {
    throw new Error(
      "EVENT_APPROVAL_FAILED",
    );
  }

  return {
    event: updatedEvent,
    changed: true,
  };
}
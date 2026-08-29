import {
  and,
  asc,
  eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
  clubMemberships,
  eventAttendance,
  events,
  users,
} from "../../db/schema/index.js";

export async function markEventAttendance(
  clubId: string,
  eventId: string,
  membershipId: string,
  markedByMembershipId: string,
  status: "PRESENT" | "ABSENT",
) {
  const [event] = await db
    .select({
      id: events.id,
      status: events.status,
    })
    .from(events)
    .where(
      and(
        eq(events.id, eventId),
        eq(events.clubId, clubId),
      ),
    )
    .limit(1);

  if (!event) {
    throw new Error("EVENT_NOT_FOUND");
  }

  if (event.status !== "APPROVED") {
    throw new Error(
      "EVENT_NOT_APPROVED",
    );
  }

  const [membership] = await db
    .select({
      id: clubMemberships.id,
      status: clubMemberships.status,
    })
    .from(clubMemberships)
    .where(
      and(
        eq(
          clubMemberships.id,
          membershipId,
        ),
        eq(
          clubMemberships.clubId,
          clubId,
        ),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error(
      "MEMBERSHIP_NOT_FOUND",
    );
  }

  if (membership.status !== "ACTIVE") {
    throw new Error(
      "MEMBERSHIP_NOT_ACTIVE",
    );
  }

  const [existingAttendance] =
    await db
      .select()
      .from(eventAttendance)
      .where(
        and(
          eq(
            eventAttendance.clubId,
            clubId,
          ),
          eq(
            eventAttendance.eventId,
            eventId,
          ),
          eq(
            eventAttendance
              .clubMembershipId,
            membershipId,
          ),
        ),
      )
      .limit(1);

  if (existingAttendance) {
    if (
      existingAttendance.status ===
      status
    ) {
      return {
        attendance:
          existingAttendance,
        changed: false,
        created: false,
      };
    }

    const [updatedAttendance] =
      await db
        .update(eventAttendance)
        .set({
          status,
          markedByMembershipId,
          markedAt: new Date(),
        })
        .where(
          eq(
            eventAttendance.id,
            existingAttendance.id,
          ),
        )
        .returning();

    if (!updatedAttendance) {
      throw new Error(
        "ATTENDANCE_UPDATE_FAILED",
      );
    }

    return {
      attendance:
        updatedAttendance,
      changed: true,
      created: false,
    };
  }

  const [attendance] =
    await db
      .insert(eventAttendance)
      .values({
        clubId,
        eventId,
        clubMembershipId:
          membershipId,
        status,
        markedByMembershipId,
      })
      .returning();

  if (!attendance) {
    throw new Error(
      "ATTENDANCE_CREATION_FAILED",
    );
  }

  return {
    attendance,
    changed: true,
    created: true,
  };
}

export async function getEventAttendance(
  clubId: string,
  eventId: string,
) {
  const [event] = await db
    .select({
      id: events.id,
    })
    .from(events)
    .where(
      and(
        eq(events.id, eventId),
        eq(events.clubId, clubId),
      ),
    )
    .limit(1);

  if (!event) {
    throw new Error(
      "EVENT_NOT_FOUND",
    );
  }

  return db
    .select({
      attendanceId:
        eventAttendance.id,

      membershipId:
        clubMemberships.id,

      userId:
        users.id,

      name:
        users.name,

      email:
        users.email,

      status:
        eventAttendance.status,

      markedByMembershipId:
        eventAttendance
          .markedByMembershipId,

      markedAt:
        eventAttendance.markedAt,
    })
    .from(eventAttendance)
    .innerJoin(
      clubMemberships,
      eq(
        eventAttendance
          .clubMembershipId,
        clubMemberships.id,
      ),
    )
    .innerJoin(
      users,
      eq(
        clubMemberships.userId,
        users.id,
      ),
    )
    .where(
      and(
        eq(
          eventAttendance.clubId,
          clubId,
        ),
        eq(
          eventAttendance.eventId,
          eventId,
        ),
      ),
    )
    .orderBy(
      asc(users.name),
    );
}
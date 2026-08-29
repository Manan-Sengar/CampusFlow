import {
  and,
  eq,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
  clubMemberships,
  eventAssignments,
  events,
  teams,
  users,
} from "../../db/schema/index.js";

import type {
  CreateEventAssignmentInput,
} from "./eventAssignment.validation.js";

export async function createEventAssignment(
  clubId: string,
  eventId: string,
  assignedByMembershipId: string,
  input: CreateEventAssignmentInput,
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
    throw new Error("EVENT_NOT_APPROVED");
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
          input.membershipId,
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

  if (
    membership.status !== "ACTIVE"
  ) {
    throw new Error(
      "MEMBERSHIP_NOT_ACTIVE",
    );
  }

  if (input.workingTeamId) {
    const [team] = await db
      .select({
        id: teams.id,
        status: teams.status,
      })
      .from(teams)
      .where(
        and(
          eq(
            teams.id,
            input.workingTeamId,
          ),
          eq(
            teams.clubId,
            clubId,
          ),
        ),
      )
      .limit(1);

    if (!team) {
      throw new Error(
        "TEAM_NOT_FOUND",
      );
    }

    if (
      team.status !== "ACTIVE"
    ) {
      throw new Error(
        "TEAM_ARCHIVED",
      );
    }
  }

  const [existingAssignment] =
    await db
      .select({
        id: eventAssignments.id,
      })
      .from(eventAssignments)
      .where(
        and(
          eq(
            eventAssignments.clubId,
            clubId,
          ),
          eq(
            eventAssignments.eventId,
            eventId,
          ),
          eq(
            eventAssignments
              .clubMembershipId,
            input.membershipId,
          ),
        ),
      )
      .limit(1);

  if (existingAssignment) {
    throw new Error(
      "EVENT_ASSIGNMENT_ALREADY_EXISTS",
    );
  }

  const [assignment] =
    await db
      .insert(eventAssignments)
      .values({
        clubId,
        eventId,

        clubMembershipId:
          input.membershipId,

        type: input.type,

        workingTeamId:
          input.workingTeamId ??
          null,

        responsibility:
          input.responsibility?.trim() ||
          null,

        assignedByMembershipId,
      })
      .returning();

  if (!assignment) {
    throw new Error(
      "EVENT_ASSIGNMENT_FAILED",
    );
  }

  return assignment;
}

export async function getEventAssignments(
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
    throw new Error("EVENT_NOT_FOUND");
  }

  return db
    .select({
      assignmentId:
        eventAssignments.id,

      membershipId:
        clubMemberships.id,

      userId: users.id,
      name: users.name,
      email: users.email,

      type:
        eventAssignments.type,

      status:
        eventAssignments.status,

      workingTeamId:
        eventAssignments
          .workingTeamId,

      workingTeamName:
        teams.name,

      responsibility:
        eventAssignments
          .responsibility,

      assignedByMembershipId:
        eventAssignments
          .assignedByMembershipId,

      createdAt:
        eventAssignments.createdAt,
    })
    .from(eventAssignments)
    .innerJoin(
      clubMemberships,
      eq(
        eventAssignments
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
    .leftJoin(
      teams,
      eq(
        eventAssignments
          .workingTeamId,
        teams.id,
      ),
    )
    .where(
      and(
        eq(
          eventAssignments.clubId,
          clubId,
        ),
        eq(
          eventAssignments.eventId,
          eventId,
        ),
      ),
    );
}

export async function respondToEventAssignment(
  clubId: string,
  eventId: string,
  assignmentId: string,
  responderMembershipId: string,
  status:
    | "ACCEPTED"
    | "DECLINED",
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

  const [assignment] = await db
    .select()
    .from(eventAssignments)
    .where(
      and(
        eq(
          eventAssignments.id,
          assignmentId,
        ),
        eq(
          eventAssignments.clubId,
          clubId,
        ),
        eq(
          eventAssignments.eventId,
          eventId,
        ),
      ),
    )
    .limit(1);

  if (!assignment) {
    throw new Error(
      "EVENT_ASSIGNMENT_NOT_FOUND",
    );
  }

  if (
    assignment.clubMembershipId !==
    responderMembershipId
  ) {
    throw new Error(
      "EVENT_ASSIGNMENT_FORBIDDEN",
    );
  }

  if (
    assignment.status === status
  ) {
    return {
      assignment,
      changed: false,
    };
  }

  const [updatedAssignment] =
    await db
      .update(eventAssignments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(
        eq(
          eventAssignments.id,
          assignmentId,
        ),
      )
      .returning();

  if (!updatedAssignment) {
    throw new Error(
      "EVENT_ASSIGNMENT_UPDATE_FAILED",
    );
  }

  return {
    assignment: updatedAssignment,
    changed: true,
  };
}
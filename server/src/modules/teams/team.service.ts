import {
  and,
  eq,
  isNull,
  sql,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
  clubMemberships,
  teamLeadAssignments,
  teamMemberships,
  teams,
  users,
} from "../../db/schema/index.js";

import type {
  CreateTeamInput,
} from "./team.validation.js";

export async function getTeamsForClub(
  clubId: string,
) {
  return db
    .select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      status: teams.status,
      createdAt: teams.createdAt,
    })
    .from(teams)
    .where(eq(teams.clubId, clubId));
}

export async function createTeam(
  clubId: string,
  input: CreateTeamInput,
) {
  const normalizedName =
    input.name.trim();

  const [existingTeam] = await db
    .select({
      id: teams.id,
    })
    .from(teams)
    .where(
      sql`
        ${teams.clubId} = ${clubId}
        AND lower(${teams.name}) =
            lower(${normalizedName})
      `,
    )
    .limit(1);

  if (existingTeam) {
    throw new Error("TEAM_ALREADY_EXISTS");
  }

  const [team] = await db
    .insert(teams)
    .values({
      clubId,
      name: normalizedName,
      description:
        input.description?.trim() || null,
    })
    .returning();

  if (!team) {
    throw new Error("TEAM_CREATION_FAILED");
  }

  return team;
}

export async function assignPrimaryTeam(
  clubId: string,
  membershipId: string,
  teamId: string,
) {
  const [membership] = await db
    .select({
      id: clubMemberships.id,
      status: clubMemberships.status,
    })
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.id, membershipId),
        eq(clubMemberships.clubId, clubId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  if (membership.status !== "ACTIVE") {
    throw new Error("MEMBERSHIP_NOT_ACTIVE");
  }

  const [team] = await db
    .select({
      id: teams.id,
      name: teams.name,
      status: teams.status,
    })
    .from(teams)
    .where(
      and(
        eq(teams.id, teamId),
        eq(teams.clubId, clubId),
      ),
    )
    .limit(1);

  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }

  if (team.status !== "ACTIVE") {
    throw new Error("TEAM_ARCHIVED");
  }

  const [currentAssignment] = await db
    .select()
    .from(teamMemberships)
    .where(
      and(
        eq(
          teamMemberships.clubMembershipId,
          membershipId,
        ),
        isNull(teamMemberships.endedAt),
      ),
    )
    .limit(1);

  if (
    currentAssignment &&
    currentAssignment.teamId === teamId
  ) {
    return {
      assignment: currentAssignment,
      team,
      changed: false,
    };
  }

  const now = new Date();

  return db.transaction(async (tx) => {
    if (currentAssignment) {
      await tx
        .update(teamMemberships)
        .set({
          endedAt: now,
        })
        .where(
          eq(
            teamMemberships.id,
            currentAssignment.id,
          ),
        );
    }

    const [newAssignment] = await tx
      .insert(teamMemberships)
      .values({
        clubId,
        clubMembershipId: membershipId,
        teamId,
        startedAt: now,
      })
      .returning();

    if (!newAssignment) {
      throw new Error(
        "TEAM_ASSIGNMENT_FAILED",
      );
    }

    return {
      assignment: newAssignment,
      team,
      changed: true,
    };
  });
}

export async function getTeamHistory(
  clubId: string,
  membershipId: string,
) {
  return db
    .select({
      assignmentId: teamMemberships.id,
      teamId: teams.id,
      teamName: teams.name,
      startedAt: teamMemberships.startedAt,
      endedAt: teamMemberships.endedAt,
    })
    .from(teamMemberships)
    .innerJoin(
      teams,
      eq(teamMemberships.teamId, teams.id),
    )
    .where(
      and(
        eq(teamMemberships.clubId, clubId),
        eq(
          teamMemberships.clubMembershipId,
          membershipId,
        ),
      ),
    )
    .orderBy(teamMemberships.startedAt);
}

export async function assignTeamLead(
  clubId: string,
  teamId: string,
  membershipId: string,
) {
  const [membership] = await db
    .select()
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.id, membershipId),
        eq(clubMemberships.clubId, clubId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  if (membership.status !== "ACTIVE") {
    throw new Error("MEMBERSHIP_NOT_ACTIVE");
  }

  const [team] = await db
    .select()
    .from(teams)
    .where(
      and(
        eq(teams.id, teamId),
        eq(teams.clubId, clubId),
      ),
    )
    .limit(1);

  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }

  if (team.status !== "ACTIVE") {
    throw new Error("TEAM_ARCHIVED");
  }

  const [existingAssignment] = await db
    .select()
    .from(teamLeadAssignments)
    .where(
      and(
        eq(
          teamLeadAssignments.teamId,
          teamId,
        ),
        eq(
          teamLeadAssignments.clubMembershipId,
          membershipId,
        ),
        isNull(
          teamLeadAssignments.endedAt,
        ),
      ),
    )
    .limit(1);

  if (existingAssignment) {
    return {
      assignment: existingAssignment,
      changed: false,
    };
  }

  const now = new Date();

  return db.transaction(async (tx) => {
    if (membership.role === "MEMBER") {
      await tx
        .update(clubMemberships)
        .set({
          role: "LEAD",
          updatedAt: now,
        })
        .where(
          eq(
            clubMemberships.id,
            membershipId,
          ),
        );
    }

    const [assignment] = await tx
      .insert(teamLeadAssignments)
      .values({
        clubId,
        teamId,
        clubMembershipId:
          membershipId,
        startedAt: now,
      })
      .returning();

    if (!assignment) {
      throw new Error(
        "TEAM_LEAD_ASSIGNMENT_FAILED",
      );
    }

    return {
      assignment,
      changed: true,
    };
  });
}

export async function removeTeamLead(
  clubId: string,
  teamId: string,
  membershipId: string,
) {
  const [assignment] = await db
    .select()
    .from(teamLeadAssignments)
    .where(
      and(
        eq(
          teamLeadAssignments.clubId,
          clubId,
        ),
        eq(
          teamLeadAssignments.teamId,
          teamId,
        ),
        eq(
          teamLeadAssignments.clubMembershipId,
          membershipId,
        ),
        isNull(
          teamLeadAssignments.endedAt,
        ),
      ),
    )
    .limit(1);

  if (!assignment) {
    throw new Error(
      "TEAM_LEAD_ASSIGNMENT_NOT_FOUND",
    );
  }

  const [updatedAssignment] =
    await db
      .update(teamLeadAssignments)
      .set({
        endedAt: new Date(),
      })
      .where(
        eq(
          teamLeadAssignments.id,
          assignment.id,
        ),
      )
      .returning();

  return updatedAssignment;
}

export async function getTeamLeads(
  clubId: string,
  teamId: string,
) {
  return db
    .select({
      assignmentId:
        teamLeadAssignments.id,

      membershipId:
        clubMemberships.id,

      userId: users.id,
      name: users.name,
      email: users.email,

      role: clubMemberships.role,

      startedAt:
        teamLeadAssignments.startedAt,
    })
    .from(teamLeadAssignments)
    .innerJoin(
      clubMemberships,
      eq(
        teamLeadAssignments.clubMembershipId,
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
          teamLeadAssignments.clubId,
          clubId,
        ),
        eq(
          teamLeadAssignments.teamId,
          teamId,
        ),
        isNull(
          teamLeadAssignments.endedAt,
        ),
      ),
    );
}
import { and, count, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  campuses,
  clubMemberships,
  clubs,
  users,
} from "../../db/schema/index.js";

import type {
  AddMemberInput,
} from "./club.validation.js";

export async function getClubsForUser(
  userId: string,
) {
  return db
    .select({
      membershipId: clubMemberships.id,
      role: clubMemberships.role,
      membershipStatus: clubMemberships.status,

      clubId: clubs.id,
      clubName: clubs.name,
      clubSlug: clubs.slug,
      clubDescription: clubs.description,
      clubStatus: clubs.status,

      campusId: campuses.id,
      campusName: campuses.name,
      campusSlug: campuses.slug,
    })
    .from(clubMemberships)
    .innerJoin(
      clubs,
      eq(clubMemberships.clubId, clubs.id),
    )
    .innerJoin(
      campuses,
      eq(clubs.campusId, campuses.id),
    )
    .where(
      and(
        eq(clubMemberships.userId, userId),
        eq(clubMemberships.status, "ACTIVE"),
      ),
    );
}

export async function getClubForUser(
  userId: string,
  clubId: string,
) {
  const [result] = await db
    .select({
      membershipId: clubMemberships.id,
      role: clubMemberships.role,
      membershipStatus: clubMemberships.status,

      clubId: clubs.id,
      clubName: clubs.name,
      clubSlug: clubs.slug,
      clubDescription: clubs.description,
      clubStatus: clubs.status,

      campusId: campuses.id,
      campusName: campuses.name,
      campusSlug: campuses.slug,
    })
    .from(clubMemberships)
    .innerJoin(
      clubs,
      eq(clubMemberships.clubId, clubs.id),
    )
    .innerJoin(
      campuses,
      eq(clubs.campusId, campuses.id),
    )
    .where(
      and(
        eq(clubMemberships.userId, userId),
        eq(clubMemberships.clubId, clubId),
        eq(clubMemberships.status, "ACTIVE"),
      ),
    )
    .limit(1);

  return result ?? null;
}

export async function getClubMembers(
  clubId: string,
) {
  return db
    .select({
      membershipId: clubMemberships.id,
      role: clubMemberships.role,
      status: clubMemberships.status,
      joinedAt: clubMemberships.joinedAt,

      userId: users.id,
      name: users.name,
      email: users.email,
    })
    .from(clubMemberships)
    .innerJoin(
      users,
      eq(clubMemberships.userId, users.id),
    )
    .where(eq(clubMemberships.clubId, clubId));
}

export async function addMemberToClub(
  clubId: string,
  input: AddMemberInput,
) {
  const normalizedEmail =
    input.email.trim().toLowerCase();

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("USER_DEACTIVATED");
  }

  const [existingMembership] = await db
    .select()
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.userId, user.id),
        eq(clubMemberships.clubId, clubId),
      ),
    )
    .limit(1);

  if (
    existingMembership &&
    existingMembership.status === "ACTIVE"
  ) {
    throw new Error("MEMBERSHIP_ALREADY_EXISTS");
  }

  if (existingMembership) {
    const [reactivatedMembership] =
      await db
        .update(clubMemberships)
        .set({
          role: input.role,
          status: "ACTIVE",
          updatedAt: new Date(),
        })
        .where(
          eq(
            clubMemberships.id,
            existingMembership.id,
          ),
        )
        .returning();

    if (!reactivatedMembership) {
      throw new Error(
        "MEMBERSHIP_UPDATE_FAILED",
      );
    }

    return {
      membership: reactivatedMembership,
      user,
      reactivated: true,
    };
  }

  const [membership] = await db
    .insert(clubMemberships)
    .values({
      userId: user.id,
      clubId,
      role: input.role,
      status: "ACTIVE",
    })
    .returning();

  if (!membership) {
    throw new Error(
      "MEMBERSHIP_CREATION_FAILED",
    );
  }

  return {
    membership,
    user,
    reactivated: false,
  };
}

export async function updateMemberRole(
  clubId: string,
  membershipId: string,
  role: "ADMIN" | "LEAD" | "MEMBER",
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

  if (
    membership.role === "ADMIN" &&
    membership.status === "ACTIVE" &&
    role !== "ADMIN"
  ) {
    const [result] = await db
      .select({
        count: count(),
      })
      .from(clubMemberships)
      .where(
        and(
          eq(clubMemberships.clubId, clubId),
          eq(clubMemberships.role, "ADMIN"),
          eq(clubMemberships.status, "ACTIVE"),
        ),
      );

    if (!result || result.count <= 1) {
      throw new Error("LAST_ADMIN_REQUIRED");
    }
  }

  const [updatedMembership] = await db
    .update(clubMemberships)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(
      eq(clubMemberships.id, membershipId),
    )
    .returning();

  return updatedMembership;
}

export async function updateMemberStatus(
  clubId: string,
  membershipId: string,
  status:
    | "ACTIVE"
    | "INACTIVE"
    | "ALUMNI"
    | "REMOVED",
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

  if (
    membership.role === "ADMIN" &&
    membership.status === "ACTIVE" &&
    status !== "ACTIVE"
  ) {
    const [result] = await db
      .select({
        count: count(),
      })
      .from(clubMemberships)
      .where(
        and(
          eq(clubMemberships.clubId, clubId),
          eq(clubMemberships.role, "ADMIN"),
          eq(clubMemberships.status, "ACTIVE"),
        ),
      );

    if (!result || result.count <= 1) {
      throw new Error("LAST_ADMIN_REQUIRED");
    }
  }

  const [updatedMembership] = await db
    .update(clubMemberships)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      eq(clubMemberships.id, membershipId),
    )
    .returning();

  return updatedMembership;
}
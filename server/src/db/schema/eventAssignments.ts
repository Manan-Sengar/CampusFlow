import { sql } from "drizzle-orm";

import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  eventAssignmentStatusEnum,
  eventAssignmentTypeEnum,
} from "./enums.js";

import { clubMemberships } from "./clubMemberships.js";
import { events } from "./events.js";
import { teams } from "./teams.js";

export const eventAssignments = pgTable(
  "event_assignments",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    clubId: uuid("club_id")
      .notNull(),

    eventId: uuid("event_id")
      .notNull(),

    clubMembershipId: uuid(
      "club_membership_id",
    ).notNull(),

    type:
      eventAssignmentTypeEnum("type")
        .notNull()
        .default("VOLUNTEER"),

    status:
      eventAssignmentStatusEnum(
        "status",
      )
        .notNull()
        .default("PENDING"),

    workingTeamId: uuid(
      "working_team_id",
    ),

    responsibility:
      text("responsibility"),

    assignedByMembershipId: uuid(
      "assigned_by_membership_id",
    ).notNull(),

    createdAt: timestamp(
      "created_at",
      {
        withTimezone: true,
      },
    )
      .notNull()
      .defaultNow(),

    updatedAt: timestamp(
      "updated_at",
      {
        withTimezone: true,
      },
    )
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [
        table.eventId,
        table.clubId,
      ],
      foreignColumns: [
        events.id,
        events.clubId,
      ],
      name:
        "event_assignments_event_club_fk",
    }).onDelete("restrict"),

    foreignKey({
      columns: [
        table.clubMembershipId,
        table.clubId,
      ],
      foreignColumns: [
        clubMemberships.id,
        clubMemberships.clubId,
      ],
      name:
        "event_assignments_member_club_fk",
    }).onDelete("restrict"),

    foreignKey({
      columns: [
        table.assignedByMembershipId,
        table.clubId,
      ],
      foreignColumns: [
        clubMemberships.id,
        clubMemberships.clubId,
      ],
      name:
        "event_assignments_assigner_club_fk",
    }).onDelete("restrict"),

    foreignKey({
      columns: [
        table.workingTeamId,
        table.clubId,
      ],
      foreignColumns: [
        teams.id,
        teams.clubId,
      ],
      name:
        "event_assignments_team_club_fk",
    }).onDelete("restrict"),

    uniqueIndex(
      "event_assignments_member_event_unique",
    ).on(
      table.eventId,
      table.clubMembershipId,
    ),

    index(
      "event_assignments_event_idx",
    ).on(table.eventId),

    index(
      "event_assignments_member_idx",
    ).on(
      table.clubMembershipId,
    ),
  ],
);
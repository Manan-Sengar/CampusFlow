import {
  foreignKey,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  attendanceStatusEnum,
} from "./enums.js";

import {
  clubMemberships,
} from "./clubMemberships.js";

import { events } from "./events.js";

export const eventAttendance = pgTable(
  "event_attendance",
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

    status:
      attendanceStatusEnum("status")
        .notNull(),

    markedByMembershipId: uuid(
      "marked_by_membership_id",
    ).notNull(),

    markedAt: timestamp(
      "marked_at",
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
        "event_attendance_event_club_fk",
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
        "event_attendance_member_club_fk",
    }).onDelete("restrict"),

    foreignKey({
      columns: [
        table.markedByMembershipId,
        table.clubId,
      ],
      foreignColumns: [
        clubMemberships.id,
        clubMemberships.clubId,
      ],
      name:
        "event_attendance_marker_club_fk",
    }).onDelete("restrict"),

    uniqueIndex(
      "event_attendance_member_event_unique",
    ).on(
      table.eventId,
      table.clubMembershipId,
    ),

    index(
      "event_attendance_event_idx",
    ).on(table.eventId),
  ],
);
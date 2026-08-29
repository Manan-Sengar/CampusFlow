import { sql } from "drizzle-orm";

import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { clubMemberships } from "./clubMemberships.js";
import { clubs } from "./clubs.js";

import {
  eventStatusEnum,
  eventVisibilityEnum,
} from "./enums.js";

export const events = pgTable(
  "events",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, {
        onDelete: "restrict",
      }),

    title: text("title")
      .notNull(),

    description: text("description"),

    venue: text("venue"),

    startAt: timestamp("start_at", {
      withTimezone: true,
    }).notNull(),

    endAt: timestamp("end_at", {
      withTimezone: true,
    }).notNull(),

    visibility:
      eventVisibilityEnum("visibility")
        .notNull()
        .default("INTERNAL"),

    status:
      eventStatusEnum("status")
        .notNull()
        .default("DRAFT"),

    createdByMembershipId: uuid(
      "created_by_membership_id",
    ).notNull(),

    approvedByMembershipId: uuid(
      "approved_by_membership_id",
    ),

    approvedAt: timestamp(
      "approved_at",
      {
        withTimezone: true,
      },
    ),

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
    unique(
      "events_id_club_unique",
    ).on(
      table.id,
      table.clubId,
    ),

    foreignKey({
      columns: [
        table.createdByMembershipId,
        table.clubId,
      ],
      foreignColumns: [
        clubMemberships.id,
        clubMemberships.clubId,
      ],
      name:
        "events_creator_club_fk",
    }).onDelete("restrict"),

    foreignKey({
      columns: [
        table.approvedByMembershipId,
        table.clubId,
      ],
      foreignColumns: [
        clubMemberships.id,
        clubMemberships.clubId,
      ],
      name:
        "events_approver_club_fk",
    }).onDelete("restrict"),

    check(
      "events_valid_dates",
      sql`${table.endAt} > ${table.startAt}`,
    ),

    index("events_club_idx").on(
      table.clubId,
    ),

    index("events_start_at_idx").on(
      table.startAt,
    ),
  ],
);
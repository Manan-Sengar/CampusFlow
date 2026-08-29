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

import {
  clubMemberships,
} from "./clubMemberships.js";

import {
  clubs,
} from "./clubs.js";

import {
  recruitmentDriveStatusEnum,
} from "./enums.js";

export const recruitmentDrives =
  pgTable(
    "recruitment_drives",
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

      description:
        text("description"),

      status:
        recruitmentDriveStatusEnum(
          "status",
        )
          .notNull()
          .default("DRAFT"),

      opensAt: timestamp(
        "opens_at",
        {
          withTimezone: true,
        },
      ).notNull(),

      closesAt: timestamp(
        "closes_at",
        {
          withTimezone: true,
        },
      ).notNull(),

      createdByMembershipId: uuid(
        "created_by_membership_id",
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
      unique(
        "recruitment_drives_id_club_unique",
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
          "recruitment_drives_creator_club_fk",
      }).onDelete("restrict"),

      check(
        "recruitment_drives_valid_dates",
        sql`${table.closesAt} > ${table.opensAt}`,
      ),

      index(
        "recruitment_drives_club_idx",
      ).on(
        table.clubId,
      ),

      index(
        "recruitment_drives_status_idx",
      ).on(
        table.status,
      ),
    ],
  );
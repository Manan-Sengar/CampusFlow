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
  applicationStatusEnum,
} from "./enums.js";

import {
  recruitmentDrives,
} from "./recruitmentDrives.js";

import {
  users,
} from "./users.js";

export const applications =
  pgTable(
    "applications",
    {
      id: uuid("id")
        .defaultRandom()
        .primaryKey(),

      clubId: uuid("club_id")
        .notNull(),

      recruitmentDriveId: uuid(
        "recruitment_drive_id",
      ).notNull(),

      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "restrict",
        }),

      motivation:
        text("motivation"),

      experience:
        text("experience"),

      status:
        applicationStatusEnum(
          "status",
        )
          .notNull()
          .default("SUBMITTED"),

      submittedAt: timestamp(
        "submitted_at",
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
          table.recruitmentDriveId,
          table.clubId,
        ],

        foreignColumns: [
          recruitmentDrives.id,
          recruitmentDrives.clubId,
        ],

        name:
          "applications_drive_club_fk",
      }).onDelete("restrict"),

      uniqueIndex(
        "applications_id_club_unique",
      ).on(
        table.id,
        table.clubId,
      ),

      uniqueIndex(
        "applications_user_drive_unique",
      ).on(
        table.userId,
        table.recruitmentDriveId,
      ),

      index(
        "applications_drive_idx",
      ).on(
        table.recruitmentDriveId,
      ),

      index(
        "applications_user_idx",
      ).on(
        table.userId,
      ),
    ],
  );
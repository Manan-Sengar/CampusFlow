import { sql } from "drizzle-orm";

import {
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  applications,
} from "./applications.js";

import {
  teams,
} from "./teams.js";

export const applicationPreferences =
  pgTable(
    "application_preferences",
    {
      id: uuid("id")
        .defaultRandom()
        .primaryKey(),

      applicationId: uuid(
        "application_id",
      ).notNull(),

      clubId: uuid("club_id")
        .notNull(),

      teamId: uuid("team_id")
        .notNull(),

      rank: integer("rank")
        .notNull(),
    },

    (table) => [
      foreignKey({
        columns: [
          table.applicationId,
          table.clubId,
        ],

        foreignColumns: [
          applications.id,
          applications.clubId,
        ],

        name:
          "application_preferences_application_club_fk",
      }).onDelete("cascade"),

      foreignKey({
        columns: [
          table.teamId,
          table.clubId,
        ],

        foreignColumns: [
          teams.id,
          teams.clubId,
        ],

        name:
          "application_preferences_team_club_fk",
      }).onDelete("restrict"),

      uniqueIndex(
        "application_preferences_team_unique",
      ).on(
        table.applicationId,
        table.teamId,
      ),

      uniqueIndex(
        "application_preferences_rank_unique",
      ).on(
        table.applicationId,
        table.rank,
      ),

      check(
        "application_preferences_positive_rank",
        sql`${table.rank} > 0`,
      ),

      index(
        "application_preferences_application_idx",
      ).on(
        table.applicationId,
      ),
    ],
  );
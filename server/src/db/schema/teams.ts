import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { clubs } from "./clubs.js";
import { teamStatusEnum } from "./enums.js";

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, {
        onDelete: "restrict",
      }),

    name: text("name").notNull(),

    description: text("description"),

    status: teamStatusEnum("status")
      .notNull()
      .default("ACTIVE"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("teams_club_name_lower_unique").on(
      table.clubId,
      sql`lower(${table.name})`,
    ),

    uniqueIndex("teams_id_club_unique").on(
      table.id,
      table.clubId,
    ),

    index("teams_club_idx").on(table.clubId),
  ],
);
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { campuses } from "./campuses.js";
import { clubStatusEnum } from "./enums.js";

export const clubs = pgTable(
  "clubs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    campusId: uuid("campus_id")
      .notNull()
      .references(() => campuses.id, {
        onDelete: "restrict",
      }),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    description: text("description"),

    status: clubStatusEnum("status")
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
    uniqueIndex("clubs_campus_slug_unique").on(
      table.campusId,
      table.slug,
    ),

    uniqueIndex("clubs_campus_name_lower_unique").on(
      table.campusId,
      sql`lower(${table.name})`,
    ),
  ],
);
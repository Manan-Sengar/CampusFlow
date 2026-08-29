import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { campusStatusEnum } from "./enums.js";

export const campuses = pgTable(
  "campuses",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    status: campusStatusEnum("status")
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
    uniqueIndex("campuses_slug_unique").on(table.slug),
  ],
);
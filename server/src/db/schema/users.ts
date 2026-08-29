import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { userStatusEnum } from "./enums.js";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    email: text("email").notNull(),

    passwordHash: text("password_hash").notNull(),

    status: userStatusEnum("status")
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
    uniqueIndex("users_email_lower_unique").on(
      sql`lower(${table.email})`,
    ),
  ],
);
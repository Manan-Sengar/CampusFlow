import {
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { clubs } from "./clubs.js";
import {
  clubRoleEnum,
  membershipStatusEnum,
} from "./enums.js";
import { users } from "./users.js";

export const clubMemberships = pgTable(
  "club_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, {
        onDelete: "restrict",
      }),

    role: clubRoleEnum("role")
      .notNull()
      .default("MEMBER"),

    status: membershipStatusEnum("status")
      .notNull()
      .default("ACTIVE"),

    joinedAt: timestamp("joined_at", {
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
    uniqueIndex("club_memberships_user_club_unique").on(
      table.userId,
      table.clubId,
    ),

    uniqueIndex("club_memberships_id_club_unique").on(
      table.id,
      table.clubId,
    ),

    index("club_memberships_club_idx").on(table.clubId),
  ],
);
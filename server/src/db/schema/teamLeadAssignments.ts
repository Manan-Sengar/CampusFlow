import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { clubMemberships } from "./clubMemberships.js";
import { teams } from "./teams.js";

export const teamLeadAssignments = pgTable(
  "team_lead_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    clubId: uuid("club_id").notNull(),

    teamId: uuid("team_id").notNull(),

    clubMembershipId: uuid("club_membership_id").notNull(),

    startedAt: timestamp("started_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    endedAt: timestamp("ended_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    foreignKey({
      columns: [
        table.clubMembershipId,
        table.clubId,
      ],
      foreignColumns: [
        clubMemberships.id,
        clubMemberships.clubId,
      ],
      name: "team_lead_assignments_membership_club_fk",
    }).onDelete("restrict"),

    foreignKey({
      columns: [
        table.teamId,
        table.clubId,
      ],
      foreignColumns: [
        teams.id,
        teams.clubId,
      ],
      name: "team_lead_assignments_team_club_fk",
    }).onDelete("restrict"),

    uniqueIndex("team_lead_assignments_active_unique")
      .on(
        table.teamId,
        table.clubMembershipId,
      )
      .where(sql`${table.endedAt} IS NULL`),

    index("team_lead_assignments_team_idx").on(table.teamId),

    check(
      "team_lead_assignments_valid_dates",
      sql`${table.endedAt} IS NULL OR ${table.endedAt} >= ${table.startedAt}`,
    ),
  ],
);
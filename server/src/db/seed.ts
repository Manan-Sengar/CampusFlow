import { and, eq } from "drizzle-orm";

import { db, pool } from "./index.js";
import {
  campuses,
  clubMemberships,
  clubs,
  users,
} from "./schema/index.js";

async function seed() {
  console.log("Seeding CampusFlow...");

  // 1. Find our existing test user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, "test@campusflow.dev"))
    .limit(1);

  if (!user) {
    throw new Error(
      "Test user does not exist. Register test@campusflow.dev first.",
    );
  }

  // 2. Create/find development campus
  let [campus] = await db
    .select()
    .from(campuses)
    .where(eq(campuses.slug, "vit-chennai"))
    .limit(1);

  if (!campus) {
    [campus] = await db
      .insert(campuses)
      .values({
        name: "VIT Chennai",
        slug: "vit-chennai",
      })
      .returning();
  }

  if (!campus) {
    throw new Error("Failed to create campus.");
  }

  // 3. Create/find development club
  let [club] = await db
    .select()
    .from(clubs)
    .where(
      and(
        eq(clubs.campusId, campus.id),
        eq(clubs.slug, "campusflow-demo-club"),
      ),
    )
    .limit(1);

  if (!club) {
    [club] = await db
      .insert(clubs)
      .values({
        campusId: campus.id,
        name: "CampusFlow Demo Club",
        slug: "campusflow-demo-club",
        description:
          "Development club used while building CampusFlow.",
      })
      .returning();
  }

  if (!club) {
    throw new Error("Failed to create club.");
  }

  // 4. Create/find second club used for isolation testing
  let [otherClub] = await db
    .select()
    .from(clubs)
    .where(
      and(
        eq(clubs.campusId, campus.id),
        eq(clubs.slug, "other-demo-club"),
      ),
    )
    .limit(1);

  if (!otherClub) {
    [otherClub] = await db
      .insert(clubs)
      .values({
        campusId: campus.id,
        name: "Other Demo Club",
        slug: "other-demo-club",
        description:
          "Used to test CampusFlow club data isolation.",
      })
      .returning();
  }

  if (!otherClub) {
    throw new Error("Failed to create second club.");
  }

  // 5. Give Test User ADMIN membership in CampusFlow Demo Club only
  const [existingMembership] = await db
    .select()
    .from(clubMemberships)
    .where(
      and(
        eq(clubMemberships.userId, user.id),
        eq(clubMemberships.clubId, club.id),
      ),
    )
    .limit(1);

  if (!existingMembership) {
    await db.insert(clubMemberships).values({
      userId: user.id,
      clubId: club.id,
      role: "ADMIN",
      status: "ACTIVE",
    });
  }

  console.log("Seed complete.");
  console.log(`Campus: ${campus.name}`);
  console.log(`Club: ${club.name}`);
  console.log(`Admin: ${user.email}`);
  console.log(`Other Club: ${otherClub.name}`);
  console.log(`Other Club ID: ${otherClub.id}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
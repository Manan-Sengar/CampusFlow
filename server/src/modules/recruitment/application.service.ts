import {
  and,
  asc,
  eq,
  inArray,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
  applicationPreferences,
  applications,
  recruitmentDrives,
  teams,
  users,
} from "../../db/schema/index.js";

import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./application.validation.js";

async function getDrive(
  clubId: string,
  driveId: string,
) {
  const [drive] = await db
    .select()
    .from(recruitmentDrives)
    .where(
      and(
        eq(
          recruitmentDrives.id,
          driveId,
        ),
        eq(
          recruitmentDrives.clubId,
          clubId,
        ),
      ),
    )
    .limit(1);

  return drive ?? null;
}

function isDriveOpen(
  drive: {
    status:
      | "DRAFT"
      | "OPEN"
      | "CLOSED"
      | "CANCELLED";

    opensAt: Date;
    closesAt: Date;
  },
) {
  const now = new Date();

  return (
    drive.status === "OPEN" &&
    now >= drive.opensAt &&
    now < drive.closesAt
  );
}

async function validatePreferences(
  clubId: string,
  preferences: {
    teamId: string;
    rank: number;
  }[],
) {
  const teamIds =
    preferences.map(
      (preference) =>
        preference.teamId,
    );

  const validTeams =
    await db
      .select({
        id: teams.id,
      })
      .from(teams)
      .where(
        and(
          eq(
            teams.clubId,
            clubId,
          ),

          eq(
            teams.status,
            "ACTIVE",
          ),

          inArray(
            teams.id,
            teamIds,
          ),
        ),
      );

  if (
    validTeams.length !==
    teamIds.length
  ) {
    throw new Error(
      "INVALID_TEAM_PREFERENCE",
    );
  }
}

async function getPreferences(
  applicationId: string,
) {
  return db
    .select({
      id:
        applicationPreferences.id,

      teamId:
        applicationPreferences
          .teamId,

      teamName:
        teams.name,

      rank:
        applicationPreferences.rank,
    })
    .from(applicationPreferences)
    .innerJoin(
      teams,
      eq(
        applicationPreferences.teamId,
        teams.id,
      ),
    )
    .where(
      eq(
        applicationPreferences
          .applicationId,
        applicationId,
      ),
    )
    .orderBy(
      asc(
        applicationPreferences.rank,
      ),
    );
}

export async function submitApplication(
  clubId: string,
  driveId: string,
  userId: string,
  input: CreateApplicationInput,
) {
  const drive =
    await getDrive(
      clubId,
      driveId,
    );

  if (!drive) {
    throw new Error(
      "RECRUITMENT_DRIVE_NOT_FOUND",
    );
  }

  if (!isDriveOpen(drive)) {
    throw new Error(
      "RECRUITMENT_DRIVE_NOT_OPEN",
    );
  }

  const [existingApplication] =
    await db
      .select({
        id: applications.id,
      })
      .from(applications)
      .where(
        and(
          eq(
            applications.userId,
            userId,
          ),
          eq(
            applications
              .recruitmentDriveId,
            driveId,
          ),
        ),
      )
      .limit(1);

  if (existingApplication) {
    throw new Error(
      "APPLICATION_ALREADY_EXISTS",
    );
  }

  await validatePreferences(
    clubId,
    input.preferences,
  );

  const application =
    await db.transaction(
      async (tx) => {
        const [createdApplication] =
          await tx
            .insert(applications)
            .values({
              clubId,

              recruitmentDriveId:
                driveId,

              userId,

              motivation:
                input.motivation
                  ?.trim() ||
                null,

              experience:
                input.experience
                  ?.trim() ||
                null,
            })
            .returning();

        if (!createdApplication) {
          throw new Error(
            "APPLICATION_CREATION_FAILED",
          );
        }

        await tx
          .insert(
            applicationPreferences,
          )
          .values(
            input.preferences.map(
              (preference) => ({
                applicationId:
                  createdApplication.id,

                clubId,

                teamId:
                  preference.teamId,

                rank:
                  preference.rank,
              }),
            ),
          );

        return createdApplication;
      },
    );

  // Transaction has committed now,
  // so the normal DB connection can
  // safely read the preferences.
  const preferences =
    await getPreferences(
      application.id,
    );

  return {
    application,
    preferences,
  };
}

export async function getMyApplication(
  clubId: string,
  driveId: string,
  userId: string,
) {
  const [application] =
    await db
      .select()
      .from(applications)
      .where(
        and(
          eq(
            applications.clubId,
            clubId,
          ),

          eq(
            applications
              .recruitmentDriveId,
            driveId,
          ),

          eq(
            applications.userId,
            userId,
          ),
        ),
      )
      .limit(1);

  if (!application) {
    return null;
  }

  const preferences =
    await getPreferences(
      application.id,
    );

  return {
    application,
    preferences,
  };
}

export async function updateMyApplication(
  clubId: string,
  driveId: string,
  userId: string,
  input: UpdateApplicationInput,
) {
  const drive =
    await getDrive(
      clubId,
      driveId,
    );

  if (!drive) {
    throw new Error(
      "RECRUITMENT_DRIVE_NOT_FOUND",
    );
  }

  if (!isDriveOpen(drive)) {
    throw new Error(
      "APPLICATION_EDITING_CLOSED",
    );
  }

  const existing =
    await getMyApplication(
      clubId,
      driveId,
      userId,
    );

  if (!existing) {
    throw new Error(
      "APPLICATION_NOT_FOUND",
    );
  }

  if (input.preferences) {
    await validatePreferences(
      clubId,
      input.preferences,
    );
  }

  const updatedApplication =
    await db.transaction(
      async (tx) => {
        const [updated] =
          await tx
            .update(applications)
            .set({
              motivation:
                input.motivation !==
                undefined
                  ? input.motivation
                      .trim() || null
                  : existing
                      .application
                      .motivation,

              experience:
                input.experience !==
                undefined
                  ? input.experience
                      .trim() || null
                  : existing
                      .application
                      .experience,

              updatedAt:
                new Date(),
            })
            .where(
              eq(
                applications.id,
                existing.application.id,
              ),
            )
            .returning();

        if (!updated) {
          throw new Error(
            "APPLICATION_UPDATE_FAILED",
          );
        }

        if (input.preferences) {
          await tx
            .delete(
              applicationPreferences,
            )
            .where(
              eq(
                applicationPreferences
                  .applicationId,
                existing.application.id,
              ),
            );

          await tx
            .insert(
              applicationPreferences,
            )
            .values(
              input.preferences.map(
                (preference) => ({
                  applicationId:
                    existing
                      .application.id,

                  clubId,

                  teamId:
                    preference.teamId,

                  rank:
                    preference.rank,
                }),
              ),
            );
        }

        return updated;
      },
    );

  // Again, read only after the
  // transaction has committed.
  const preferences =
    await getPreferences(
      updatedApplication.id,
    );

  return {
    application:
      updatedApplication,

    preferences,
  };
}

export async function getApplicationsForDrive(
  clubId: string,
  driveId: string,
) {
  const drive =
    await getDrive(
      clubId,
      driveId,
    );

  if (!drive) {
    throw new Error(
      "RECRUITMENT_DRIVE_NOT_FOUND",
    );
  }

  const driveApplications =
    await db
      .select({
        id:
          applications.id,

        userId:
          users.id,

        name:
          users.name,

        email:
          users.email,

        motivation:
          applications.motivation,

        experience:
          applications.experience,

        status:
          applications.status,

        submittedAt:
          applications.submittedAt,

        updatedAt:
          applications.updatedAt,
      })
      .from(applications)
      .innerJoin(
        users,
        eq(
          applications.userId,
          users.id,
        ),
      )
      .where(
        and(
          eq(
            applications.clubId,
            clubId,
          ),

          eq(
            applications
              .recruitmentDriveId,
            driveId,
          ),
        ),
      );

  return Promise.all(
    driveApplications.map(
      async (application) => ({
        ...application,

        preferences:
          await getPreferences(
            application.id,
          ),
      }),
    ),
  );
}

export async function updateApplicationStatus(
  clubId: string,
  driveId: string,
  applicationId: string,
  status:
    | "UNDER_REVIEW"
    | "SHORTLISTED"
    | "SELECTED"
    | "REJECTED",
) {
  const drive =
    await getDrive(
      clubId,
      driveId,
    );

  if (!drive) {
    throw new Error(
      "RECRUITMENT_DRIVE_NOT_FOUND",
    );
  }

  const [application] =
    await db
      .select()
      .from(applications)
      .where(
        and(
          eq(
            applications.id,
            applicationId,
          ),

          eq(
            applications.clubId,
            clubId,
          ),

          eq(
            applications
              .recruitmentDriveId,
            driveId,
          ),
        ),
      )
      .limit(1);

  if (!application) {
    throw new Error(
      "APPLICATION_NOT_FOUND",
    );
  }

  if (
    application.status ===
    "WITHDRAWN"
  ) {
    throw new Error(
      "WITHDRAWN_APPLICATION",
    );
  }

  if (
    application.status === status
  ) {
    return {
      application,
      changed: false,
    };
  }

  const [updatedApplication] =
    await db
      .update(applications)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(
            applications.id,
            applicationId,
          ),

          eq(
            applications.clubId,
            clubId,
          ),

          eq(
            applications
              .recruitmentDriveId,
            driveId,
          ),
        ),
      )
      .returning();

  if (!updatedApplication) {
    throw new Error(
      "APPLICATION_STATUS_UPDATE_FAILED",
    );
  }

  return {
    application:
      updatedApplication,
    changed: true,
  };
}
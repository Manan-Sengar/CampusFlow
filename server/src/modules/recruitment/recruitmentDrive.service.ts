import {
  and,
  desc,
  eq,
  inArray,
} from "drizzle-orm";

import { db } from "../../db/index.js";

import {
  recruitmentDrives,
} from "../../db/schema/index.js";

import type {
  CreateRecruitmentDriveInput,
} from "./recruitmentDrive.validation.js";

type DriveStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "CANCELLED";

type TargetDriveStatus =
  | "OPEN"
  | "CLOSED"
  | "CANCELLED";

export async function createRecruitmentDrive(
  clubId: string,
  creatorMembershipId: string,
  input: CreateRecruitmentDriveInput,
) {
  const [drive] = await db
    .insert(recruitmentDrives)
    .values({
      clubId,

      title:
        input.title.trim(),

      description:
        input.description?.trim() ||
        null,

      status: "DRAFT",

      opensAt:
        input.opensAt,

      closesAt:
        input.closesAt,

      createdByMembershipId:
        creatorMembershipId,
    })
    .returning();

  if (!drive) {
    throw new Error(
      "RECRUITMENT_DRIVE_CREATION_FAILED",
    );
  }

  return drive;
}

export async function getRecruitmentDrivesForClub(
  clubId: string,
  includeInternal: boolean,
) {
  if (includeInternal) {
    return db
      .select()
      .from(recruitmentDrives)
      .where(
        eq(
          recruitmentDrives.clubId,
          clubId,
        ),
      )
      .orderBy(
        desc(
          recruitmentDrives.opensAt,
        ),
      );
  }

  return db
    .select()
    .from(recruitmentDrives)
    .where(
      and(
        eq(
          recruitmentDrives.clubId,
          clubId,
        ),

        inArray(
          recruitmentDrives.status,
          [
            "OPEN",
            "CLOSED",
          ],
        ),
      ),
    )
    .orderBy(
      desc(
        recruitmentDrives.opensAt,
      ),
    );
}

export async function getRecruitmentDriveForClub(
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

function canTransition(
  current: DriveStatus,
  target: TargetDriveStatus,
) {
  const allowedTransitions: Record<
    DriveStatus,
    TargetDriveStatus[]
  > = {
    DRAFT: [
      "OPEN",
      "CANCELLED",
    ],

    OPEN: [
      "CLOSED",
      "CANCELLED",
    ],

    CLOSED: [],

    CANCELLED: [],
  };

  return allowedTransitions[
    current
  ].includes(target);
}

export async function updateRecruitmentDriveStatus(
  clubId: string,
  driveId: string,
  status: TargetDriveStatus,
) {
  const drive =
    await getRecruitmentDriveForClub(
      clubId,
      driveId,
    );

  if (!drive) {
    throw new Error(
      "RECRUITMENT_DRIVE_NOT_FOUND",
    );
  }

  if (drive.status === status) {
    return {
      drive,
      changed: false,
    };
  }

  if (
    !canTransition(
      drive.status,
      status,
    )
  ) {
    throw new Error(
      "INVALID_DRIVE_STATUS_TRANSITION",
    );
  }

  const now = new Date();

  if (status === "OPEN") {
    if (now < drive.opensAt) {
      throw new Error(
        "DRIVE_NOT_STARTED",
      );
    }

    if (now >= drive.closesAt) {
      throw new Error(
        "DRIVE_WINDOW_ENDED",
      );
    }
  }

  const [updatedDrive] =
    await db
      .update(
        recruitmentDrives,
      )
      .set({
        status,
        updatedAt: now,
      })
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
      .returning();

  if (!updatedDrive) {
    throw new Error(
      "RECRUITMENT_DRIVE_UPDATE_FAILED",
    );
  }

  return {
    drive: updatedDrive,
    changed: true,
  };
}
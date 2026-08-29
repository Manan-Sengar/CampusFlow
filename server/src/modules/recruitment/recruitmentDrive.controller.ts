import type {
  Request,
  Response,
} from "express";

import {
  getClubForUser,
} from "../clubs/club.service.js";

import {
  createRecruitmentDrive,
  getRecruitmentDriveForClub,
  getRecruitmentDrivesForClub,
  updateRecruitmentDriveStatus,
} from "./recruitmentDrive.service.js";

import {
  createRecruitmentDriveSchema,
  recruitmentDriveIdSchema,
  updateRecruitmentDriveStatusSchema,
} from "./recruitmentDrive.validation.js";

export async function createClubRecruitmentDrive(
  req: Request<{
    clubId: string;
  }>,
  res: Response,
) {
  const parsed =
    createRecruitmentDriveSchema
      .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",

        message:
          "Invalid recruitment drive data.",

        details:
          parsed.error.flatten(),
      },
    });
  }

  const drive =
    await createRecruitmentDrive(
      req.params.clubId,

      res.locals.clubAccess
        .membershipId,

      parsed.data,
    );

  return res.status(201).json({
    drive,
  });
}

export async function listRecruitmentDrives(
  req: Request<{
    clubId: string;
  }>,
  res: Response,
) {
  const userId =
    res.locals.auth.user.id;

  const clubAccess =
    await getClubForUser(
      userId,
      req.params.clubId,
    );

  const includeInternal =
    clubAccess?.role === "ADMIN" ||
    clubAccess?.role === "LEAD";

  const drives =
    await getRecruitmentDrivesForClub(
      req.params.clubId,
      includeInternal,
    );

  return res.status(200).json({
    drives,
  });
}

export async function getRecruitmentDrive(
  req: Request<{
    clubId: string;
    driveId: string;
  }>,
  res: Response,
) {
  const parsedDriveId =
    recruitmentDriveIdSchema
      .safeParse(
        req.params.driveId,
      );

  if (!parsedDriveId.success) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_RECRUITMENT_DRIVE_ID",

        message:
          "Invalid recruitment drive ID.",
      },
    });
  }

  const drive =
    await getRecruitmentDriveForClub(
      req.params.clubId,
      parsedDriveId.data,
    );

  if (!drive) {
    return res.status(404).json({
      error: {
        code:
          "RECRUITMENT_DRIVE_NOT_FOUND",

        message:
          "Recruitment drive not found.",
      },
    });
  }

  const userId =
    res.locals.auth.user.id;

  const clubAccess =
    await getClubForUser(
      userId,
      req.params.clubId,
    );

  const canSeeInternal =
    clubAccess?.role === "ADMIN" ||
    clubAccess?.role === "LEAD";

  if (
    !canSeeInternal &&
    (
      drive.status === "DRAFT" ||
      drive.status ===
        "CANCELLED"
    )
  ) {
    return res.status(404).json({
      error: {
        code:
          "RECRUITMENT_DRIVE_NOT_FOUND",

        message:
          "Recruitment drive not found.",
      },
    });
  }

  return res.status(200).json({
    drive,
  });
}

export async function changeRecruitmentDriveStatus(
  req: Request<{
    clubId: string;
    driveId: string;
  }>,
  res: Response,
) {
  const parsedDriveId =
    recruitmentDriveIdSchema
      .safeParse(
        req.params.driveId,
      );

  if (!parsedDriveId.success) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_RECRUITMENT_DRIVE_ID",

        message:
          "Invalid recruitment drive ID.",
      },
    });
  }

  const parsed =
    updateRecruitmentDriveStatusSchema
      .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",

        message:
          "Invalid recruitment drive status.",
      },
    });
  }

  try {
    const result =
      await updateRecruitmentDriveStatus(
        req.params.clubId,
        parsedDriveId.data,
        parsed.data.status,
      );

    return res.status(200).json(
      result,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "RECRUITMENT_DRIVE_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "RECRUITMENT_DRIVE_NOT_FOUND",

          message:
            "Recruitment drive not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_DRIVE_STATUS_TRANSITION"
    ) {
      return res.status(409).json({
        error: {
          code:
            "INVALID_DRIVE_STATUS_TRANSITION",

          message:
            "The recruitment drive cannot move to that status from its current state.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "DRIVE_NOT_STARTED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "DRIVE_NOT_STARTED",

          message:
            "The recruitment drive opening time has not arrived yet.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "DRIVE_WINDOW_ENDED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "DRIVE_WINDOW_ENDED",

          message:
            "The recruitment drive closing time has already passed.",
        },
      });
    }

    throw error;
  }
}
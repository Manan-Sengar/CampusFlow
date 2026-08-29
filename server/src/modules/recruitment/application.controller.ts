import type {
  Request,
  Response,
} from "express";

import {
  applicationIdSchema,
  createApplicationSchema,
  updateApplicationSchema,
  updateApplicationStatusSchema,
} from "./application.validation.js";

import {
  getApplicationsForDrive,
  getMyApplication,
  submitApplication,
  updateApplicationStatus,
  updateMyApplication,
} from "./application.service.js";

import {
  recruitmentDriveIdSchema,
} from "./recruitmentDrive.validation.js";

export async function submitMyApplication(
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
    createApplicationSchema
      .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",

        message:
          "Invalid application data.",

        details:
          parsed.error.flatten(),
      },
    });
  }

  try {
    const result =
      await submitApplication(
        req.params.clubId,
        parsedDriveId.data,
        res.locals.auth.user.id,
        parsed.data,
      );

    return res.status(201).json(
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
        "RECRUITMENT_DRIVE_NOT_OPEN"
    ) {
      return res.status(409).json({
        error: {
          code:
            "RECRUITMENT_DRIVE_NOT_OPEN",

          message:
            "Applications are not currently open for this drive.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "APPLICATION_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        error: {
          code:
            "APPLICATION_ALREADY_EXISTS",

          message:
            "You have already applied to this recruitment drive.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_TEAM_PREFERENCE"
    ) {
      return res.status(400).json({
        error: {
          code:
            "INVALID_TEAM_PREFERENCE",

          message:
            "One or more selected teams are invalid.",
        },
      });
    }

    throw error;
  }
}

export async function viewMyApplication(
  req: Request<{
    clubId: string;
    driveId: string;
  }>,
  res: Response,
) {
  const parsed =
    recruitmentDriveIdSchema
      .safeParse(
        req.params.driveId,
      );

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_RECRUITMENT_DRIVE_ID",

        message:
          "Invalid recruitment drive ID.",
      },
    });
  }

  const result =
    await getMyApplication(
      req.params.clubId,
      parsed.data,
      res.locals.auth.user.id,
    );

  if (!result) {
    return res.status(404).json({
      error: {
        code:
          "APPLICATION_NOT_FOUND",

        message:
          "Application not found.",
      },
    });
  }

  return res.status(200).json(
    result,
  );
}

export async function editMyApplication(
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
    updateApplicationSchema
      .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",

        message:
          "Invalid application update.",

        details:
          parsed.error.flatten(),
      },
    });
  }

  try {
    const result =
      await updateMyApplication(
        req.params.clubId,
        parsedDriveId.data,
        res.locals.auth.user.id,
        parsed.data,
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
        "APPLICATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "APPLICATION_NOT_FOUND",

          message:
            "Application not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "APPLICATION_EDITING_CLOSED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "APPLICATION_EDITING_CLOSED",

          message:
            "Applications can no longer be edited because the recruitment drive is not open.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_TEAM_PREFERENCE"
    ) {
      return res.status(400).json({
        error: {
          code:
            "INVALID_TEAM_PREFERENCE",

          message:
            "One or more selected teams are invalid.",
        },
      });
    }

    throw error;
  }
}

export async function listDriveApplications(
  req: Request<{
    clubId: string;
    driveId: string;
  }>,
  res: Response,
) {
  const parsed =
    recruitmentDriveIdSchema
      .safeParse(
        req.params.driveId,
      );

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_RECRUITMENT_DRIVE_ID",

        message:
          "Invalid recruitment drive ID.",
      },
    });
  }

  try {
    const applications =
      await getApplicationsForDrive(
        req.params.clubId,
        parsed.data,
      );

    return res.status(200).json({
      applications,
    });
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

    throw error;
  }
}

export async function changeApplicationStatus(
  req: Request<{
    clubId: string;
    driveId: string;
    applicationId: string;
  }>,
  res: Response,
) {
  const parsedDriveId =
    recruitmentDriveIdSchema
      .safeParse(
        req.params.driveId,
      );

  const parsedApplicationId =
    applicationIdSchema
      .safeParse(
        req.params.applicationId,
      );

  if (
    !parsedDriveId.success ||
    !parsedApplicationId.success
  ) {
    return res.status(400).json({
      error: {
        code:
          "INVALID_APPLICATION_REQUEST",

        message:
          "Invalid recruitment drive or application ID.",
      },
    });
  }

  const parsedStatus =
    updateApplicationStatusSchema
      .safeParse(req.body);

  if (!parsedStatus.success) {
    return res.status(400).json({
      error: {
        code:
          "VALIDATION_ERROR",

        message:
          "Invalid application status.",
      },
    });
  }

  try {
    const result =
      await updateApplicationStatus(
        req.params.clubId,
        parsedDriveId.data,
        parsedApplicationId.data,
        parsedStatus.data.status,
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
        "APPLICATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "APPLICATION_NOT_FOUND",

          message:
            "Application not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "WITHDRAWN_APPLICATION"
    ) {
      return res.status(409).json({
        error: {
          code:
            "WITHDRAWN_APPLICATION",

          message:
            "A withdrawn application cannot be reviewed.",
        },
      });
    }

    throw error;
  }
}
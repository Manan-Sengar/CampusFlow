import type {
  Request,
  Response,
} from "express";

import {
  addMemberToClub,
  getClubMembers,
  getClubsForUser,
  updateMemberRole,
  updateMemberStatus,
} from "./club.service.js";

import {
  addMemberSchema,
  updateMemberRoleSchema,
  updateMemberStatusSchema,
} from "./club.validation.js";

export async function listMyClubs(
  _req: Request,
  res: Response,
) {
  const userId =
    res.locals.auth.user.id;

  const clubs =
    await getClubsForUser(userId);

  return res.status(200).json({
    clubs,
  });
}

export async function getClub(
  _req: Request<{ clubId: string }>,
  res: Response,
) {
  return res.status(200).json({
    club: res.locals.clubAccess,
  });
}

export async function listClubMembers(
  req: Request<{ clubId: string }>,
  res: Response,
) {
  const members =
    await getClubMembers(
      req.params.clubId,
    );

  return res.status(200).json({
    members,
  });
}

export async function addClubMember(
  req: Request<{ clubId: string }>,
  res: Response,
) {
  const parsed =
    addMemberSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message:
          "Invalid member data.",
        details:
          parsed.error.flatten(),
      },
    });
  }

  try {
    const result =
      await addMemberToClub(
        req.params.clubId,
        parsed.data,
      );

    return res
      .status(
        result.reactivated ? 200 : 201,
      )
      .json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message:
            "No CampusFlow user exists with that email.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "MEMBERSHIP_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        error: {
          code:
            "MEMBERSHIP_ALREADY_EXISTS",
          message:
            "This user is already an active member of the club.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "USER_DEACTIVATED"
    ) {
      return res.status(409).json({
        error: {
          code: "USER_DEACTIVATED",
          message:
            "A deactivated user cannot be added to a club.",
        },
      });
    }

    throw error;
  }
}

export async function changeMemberRole(
  req: Request<{
    clubId: string;
    membershipId: string;
  }>,
  res: Response,
) {
  const parsed =
    updateMemberRoleSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid role.",
        details:
          parsed.error.flatten(),
      },
    });
  }

  try {
    const membership =
      await updateMemberRole(
        req.params.clubId,
        req.params.membershipId,
        parsed.data.role,
      );

    return res.status(200).json({
      membership,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "MEMBERSHIP_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "MEMBERSHIP_NOT_FOUND",
          message:
            "Membership not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "LAST_ADMIN_REQUIRED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "LAST_ADMIN_REQUIRED",
          message:
            "A club must have at least one active administrator.",
        },
      });
    }

    throw error;
  }
}

export async function changeMemberStatus(
  req: Request<{
    clubId: string;
    membershipId: string;
  }>,
  res: Response,
) {
  const parsed =
    updateMemberStatusSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message:
          "Invalid membership status.",
        details:
          parsed.error.flatten(),
      },
    });
  }

  try {
    const membership =
      await updateMemberStatus(
        req.params.clubId,
        req.params.membershipId,
        parsed.data.status,
      );

    return res.status(200).json({
      membership,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "MEMBERSHIP_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "MEMBERSHIP_NOT_FOUND",
          message:
            "Membership not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "LAST_ADMIN_REQUIRED"
    ) {
      return res.status(409).json({
        error: {
          code:
            "LAST_ADMIN_REQUIRED",
          message:
            "A club must have at least one active administrator.",
        },
      });
    }

    throw error;
  }
}
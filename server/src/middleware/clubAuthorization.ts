import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { z } from "zod";

import { getClubForUser } from "../modules/clubs/club.service.js";

type ClubRole =
  | "ADMIN"
  | "LEAD"
  | "MEMBER";

const clubIdSchema = z.string().uuid();

export async function requireClubMembership(
  req: Request<{ clubId: string }>,
  res: Response,
  next: NextFunction,
) {
  const parsedClubId =
    clubIdSchema.safeParse(req.params.clubId);

  if (!parsedClubId.success) {
    return res.status(400).json({
      error: {
        code: "INVALID_CLUB_ID",
        message: "Club ID is invalid.",
      },
    });
  }

  const userId =
    res.locals.auth.user.id;

  const clubAccess =
    await getClubForUser(
      userId,
      parsedClubId.data,
    );

  if (!clubAccess) {
    return res.status(404).json({
      error: {
        code: "CLUB_NOT_FOUND",
        message:
          "Club does not exist or you do not have access.",
      },
    });
  }

  res.locals.clubAccess = clubAccess;

  next();
}

export function requireClubRole(
  ...allowedRoles: ClubRole[]
) {
  return (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const clubAccess =
      res.locals.clubAccess;

    if (!clubAccess) {
      return res.status(500).json({
        error: {
          code: "AUTHORIZATION_CONTEXT_MISSING",
          message:
            "Club authorization context is missing.",
        },
      });
    }

    if (
      !allowedRoles.includes(
        clubAccess.role,
      )
    ) {
      return res.status(403).json({
        error: {
          code: "INSUFFICIENT_CLUB_PERMISSION",
          message:
            "You do not have permission to perform this action.",
        },
      });
    }

    next();
  };
}
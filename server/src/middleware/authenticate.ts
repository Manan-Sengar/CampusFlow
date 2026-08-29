import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  SESSION_COOKIE_NAME,
} from "../modules/auth/auth.session.js";

import {
  getUserFromSessionToken,
} from "../modules/auth/auth.service.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token =
    req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message:
          "Authentication is required.",
      },
    });
  }

  const session =
    await getUserFromSessionToken(token);

  if (!session) {
    return res.status(401).json({
      error: {
        code: "INVALID_SESSION",
        message:
          "Your session is invalid or expired.",
      },
    });
  }

  res.locals.auth = session;

  next();
}
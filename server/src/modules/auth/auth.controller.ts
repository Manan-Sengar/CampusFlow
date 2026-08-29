import type {
  Request,
  Response,
} from "express";

import { env } from "../../config/env.js";

import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "./auth.session.js";

import {
  deleteSession,
  loginUser,
  registerUser,
} from "./auth.service.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.validation.js";

function setSessionCookie(
  res: Response,
  token: string,
) {
  res.cookie(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS,
      path: "/",
    },
  );
}

export async function register(
  req: Request,
  res: Response,
) {
  const parsed =
    registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid registration data",
        details: parsed.error.flatten(),
      },
    });
  }

  try {
    const result =
      await registerUser(parsed.data);

    setSessionCookie(res, result.token);

    return res.status(201).json({
      user: result.user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message:
            "An account with this email already exists.",
        },
      });
    }

    console.error(error);

    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          "An unexpected error occurred.",
      },
    });
  }
}

export async function login(
  req: Request,
  res: Response,
) {
  const parsed =
    loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid login data",
      },
    });
  }

  try {
    const result =
      await loginUser(parsed.data);

    setSessionCookie(res, result.token);

    return res.status(200).json({
      user: result.user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            "Email or password is incorrect.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message === "ACCOUNT_DEACTIVATED"
    ) {
      return res.status(403).json({
        error: {
          code: "ACCOUNT_DEACTIVATED",
          message:
            "This account is deactivated.",
        },
      });
    }

    console.error(error);

    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          "An unexpected error occurred.",
      },
    });
  }
}

export async function me(
  _req: Request,
  res: Response,
) {
  return res.status(200).json({
    user: res.locals.auth.user,
  });
}

export async function logout(
  req: Request,
  res: Response,
) {
  const token =
    req.cookies?.[SESSION_COOKIE_NAME];

  if (token) {
    await deleteSession(token);
  }

  res.clearCookie(
    SESSION_COOKIE_NAME,
    {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  );

  return res.status(204).send();
}
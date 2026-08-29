import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  authSessions,
  users,
} from "../../db/schema/index.js";

import type {
  LoginInput,
  RegisterInput,
} from "./auth.validation.js";

import {
  generateSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from "./auth.session.js";

const SALT_ROUNDS = 12;

export async function registerUser(
  input: RegisterInput,
) {
  const normalizedEmail = input.email
    .trim()
    .toLowerCase();

  const existingUser = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS,
  );

  const [user] = await db
    .insert(users)
    .values({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
      createdAt: users.createdAt,
    });

  if (!user) {
    throw new Error("USER_CREATION_FAILED");
  }

  const session = await createSession(user.id);

  return {
    user,
    ...session,
  };
}

export async function loginUser(
  input: LoginInput,
) {
  const normalizedEmail = input.email
    .trim()
    .toLowerCase();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("ACCOUNT_DEACTIVATED");
  }

  const passwordMatches =
    await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const session = await createSession(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
    },
    ...session,
  };
}

async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiry();

  await db.insert(authSessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

export async function getUserFromSessionToken(
  token: string,
) {
  const tokenHash = hashSessionToken(token);

  const [result] = await db
    .select({
      sessionId: authSessions.id,

      userId: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(authSessions)
    .innerJoin(
      users,
      eq(authSessions.userId, users.id),
    )
    .where(
      and(
        eq(authSessions.tokenHash, tokenHash),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!result) {
    return null;
  }

  if (result.status !== "ACTIVE") {
    return null;
  }

  return {
    sessionId: result.sessionId,

    user: {
      id: result.userId,
      name: result.name,
      email: result.email,
      status: result.status,
      createdAt: result.createdAt,
    },
  };
}

export async function deleteSession(
  token: string,
) {
  const tokenHash = hashSessionToken(token);

  await db
    .delete(authSessions)
    .where(
      eq(authSessions.tokenHash, tokenHash),
    );
}
import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE_NAME = "campusflow_session";

export const SESSION_DURATION_MS =
  1000 * 60 * 60 * 24 * 7; // 7 days

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function getSessionExpiry() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}
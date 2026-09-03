import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { pool } from "./db/index.js";

import authRouter from "./modules/auth/auth.routes.js";

import { errorHandler } from "./middleware/errorHandler.js";

import clubRouter from "./modules/clubs/club.routes.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

// Cross-site production cookies need a write-request origin check, not just CORS headers.
app.use((req, res, next) => {
  if (
    env.NODE_ENV === "production" &&
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.get("Origin") !== env.CLIENT_ORIGIN
  ) {
    res.status(403).json({
      error: {
        code: "UNTRUSTED_ORIGIN",
        message: "This request must come from the configured CampusFlow frontend.",
      },
    });
    return;
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/clubs", clubRouter);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CampusFlow API is running",
  });
});

app.get("/api/v1/health/db", async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.status(200).json({
      status: "ok",
      database: "connected",
      currentTime: result.rows[0].current_time,
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export default app;

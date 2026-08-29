import { Router } from "express";

import {
  login,
  logout,
  me,
  register,
} from "./auth.controller.js";

import {
  authenticate,
} from "../../middleware/authenticate.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticate, me);
authRouter.post("/logout", logout);

export default authRouter;
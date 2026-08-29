import { Router } from "express";

import {
  requireClubRole,
} from "../../middleware/clubAuthorization.js";

import {
  addTeamLead,
  createClubTeam,
  deleteTeamLead,
  listTeamLeads,
  listTeams,
} from "./team.controller.js";

const teamRouter = Router({
  mergeParams: true,
});

teamRouter.get(
  "/",
  listTeams,
);

teamRouter.get(
  "/:teamId/leads",
  listTeamLeads,
);

teamRouter.post(
  "/",
  requireClubRole("ADMIN"),
  createClubTeam,
);

teamRouter.post(
  "/:teamId/leads/:membershipId",
  requireClubRole("ADMIN"),
  addTeamLead,
);

teamRouter.delete(
  "/:teamId/leads/:membershipId",
  requireClubRole("ADMIN"),
  deleteTeamLead,
);

export default teamRouter;
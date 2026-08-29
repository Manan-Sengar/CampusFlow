import { Router } from "express";

import {
  authenticate,
} from "../../middleware/authenticate.js";

import {
  addClubMember,
  getClub,
  listClubMembers,
  listMyClubs,
  changeMemberRole,
  changeMemberStatus,
} from "./club.controller.js";

import {
  requireClubMembership,
  requireClubRole,
} from "../../middleware/clubAuthorization.js";

import teamRouter from "../teams/team.routes.js";

import {
  assignMemberPrimaryTeam,
  listMemberTeamHistory,
} from "../teams/team.controller.js";

import eventRouter from "../events/event.routes.js";

import recruitmentDriveRouter
  from "../recruitment/recruitmentDrive.routes.js";

const clubRouter = Router();

clubRouter.use(authenticate);

clubRouter.use(
  "/:clubId/teams",
  requireClubMembership,
  teamRouter,
);

clubRouter.use(
  "/:clubId/events",
  requireClubMembership,
  eventRouter,
);

clubRouter.use(
  "/:clubId/recruitment-drives",
  recruitmentDriveRouter,
);

clubRouter.get(
  "/",
  listMyClubs,
);

clubRouter.get(
  "/:clubId",
  requireClubMembership,
  getClub,
);

clubRouter.get(
  "/:clubId/members",
  requireClubMembership,
  listClubMembers,
);

clubRouter.get(
  "/:clubId/members/:membershipId/team-history",
  requireClubMembership,
  listMemberTeamHistory,
);

clubRouter.post(
  "/:clubId/members",
  requireClubMembership,
  requireClubRole("ADMIN"),
  addClubMember,
);

clubRouter.patch(
  "/:clubId/members/:membershipId/role",
  requireClubMembership,
  requireClubRole("ADMIN"),
  changeMemberRole,
);

clubRouter.patch(
  "/:clubId/members/:membershipId/status",
  requireClubMembership,
  requireClubRole("ADMIN"),
  changeMemberStatus,
);

clubRouter.put(
  "/:clubId/members/:membershipId/team",
  requireClubMembership,
  requireClubRole("ADMIN"),
  assignMemberPrimaryTeam,
);

export default clubRouter;
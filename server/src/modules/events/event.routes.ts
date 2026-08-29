import {
  Router,
} from "express";

import {
  requireClubRole,
} from "../../middleware/clubAuthorization.js";

import {
  approveClubEvent,
  createClubEvent,
  getClubEvent,
  listClubEvents,
} from "./event.controller.js";

import {
  addEventAssignment,
  listEventAssignments,
  respondToAssignment,
} from "./eventAssignment.controller.js";

import {
  listAttendance,
  markAttendance,
} from "./eventAttendance.controller.js";

const eventRouter = Router({
  mergeParams: true,
});

eventRouter.get(
  "/",
  listClubEvents,
);

eventRouter.get(
  "/:eventId",
  getClubEvent,
);

eventRouter.post(
  "/",
  requireClubRole(
    "ADMIN",
    "LEAD",
  ),
  createClubEvent,
);

eventRouter.post(
  "/:eventId/approve",
  requireClubRole("ADMIN"),
  approveClubEvent,
);

eventRouter.get(
  "/:eventId/assignments",
  listEventAssignments,
);

eventRouter.post(
  "/:eventId/assignments",
  requireClubRole(
    "ADMIN",
    "LEAD",
  ),
  addEventAssignment,
);

eventRouter.patch(
  "/:eventId/assignments/:assignmentId/response",
  respondToAssignment,
);

eventRouter.get(
  "/:eventId/attendance",
  requireClubRole(
    "ADMIN",
    "LEAD",
  ),
  listAttendance,
);

eventRouter.put(
  "/:eventId/attendance/:membershipId",
  requireClubRole(
    "ADMIN",
    "LEAD",
  ),
  markAttendance,
);

export default eventRouter;
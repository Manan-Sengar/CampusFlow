import {
  Router,
} from "express";

import {
  requireClubMembership,
  requireClubRole,
} from "../../middleware/clubAuthorization.js";

import {
  changeRecruitmentDriveStatus,
  createClubRecruitmentDrive,
  getRecruitmentDrive,
  listRecruitmentDrives,
} from "./recruitmentDrive.controller.js";

import {
  changeApplicationStatus,
  editMyApplication,
  listDriveApplications,
  submitMyApplication,
  viewMyApplication,
} from "./application.controller.js";

const recruitmentDriveRouter =
  Router({
    mergeParams: true,
  });

recruitmentDriveRouter.get(
  "/",
  listRecruitmentDrives,
);

recruitmentDriveRouter.get(
  "/:driveId",
  getRecruitmentDrive,
);

recruitmentDriveRouter.post(
  "/",
  requireClubMembership,
  requireClubRole("ADMIN"),
  createClubRecruitmentDrive,
);

recruitmentDriveRouter.patch(
  "/:driveId/status",
  requireClubMembership,
  requireClubRole("ADMIN"),
  changeRecruitmentDriveStatus,
);

recruitmentDriveRouter.post(
  "/:driveId/applications",
  submitMyApplication,
);

recruitmentDriveRouter.get(
  "/:driveId/my-application",
  viewMyApplication,
);

recruitmentDriveRouter.patch(
  "/:driveId/my-application",
  editMyApplication,
);

recruitmentDriveRouter.get(
  "/:driveId/applications",
  requireClubMembership,
  requireClubRole("ADMIN"),
  listDriveApplications,
);

recruitmentDriveRouter.patch(
  "/:driveId/applications/:applicationId/status",
  requireClubMembership,
  requireClubRole("ADMIN"),
  changeApplicationStatus,
);

export default recruitmentDriveRouter;
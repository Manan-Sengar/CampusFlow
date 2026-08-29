import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "DEACTIVATED",
]);

export const campusStatusEnum = pgEnum("campus_status", [
  "ACTIVE",
  "ARCHIVED",
]);

export const clubStatusEnum = pgEnum("club_status", [
  "ACTIVE",
  "ARCHIVED",
]);

export const clubRoleEnum = pgEnum("club_role", [
  "ADMIN",
  "LEAD",
  "MEMBER",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "ACTIVE",
  "INACTIVE",
  "ALUMNI",
  "REMOVED",
]);

export const teamStatusEnum = pgEnum("team_status", [
  "ACTIVE",
  "ARCHIVED",
]);

export const eventVisibilityEnum = pgEnum(
  "event_visibility",
  [
    "PUBLIC",
    "INTERNAL",
  ],
);

export const eventStatusEnum = pgEnum(
  "event_status",
  [
    "DRAFT",
    "PENDING_APPROVAL",
    "APPROVED",
    "COMPLETED",
    "CANCELLED",
  ],
);

export const eventAssignmentTypeEnum = pgEnum(
  "event_assignment_type",
  [
    "COORDINATOR",
    "VOLUNTEER",
  ],
);

export const eventAssignmentStatusEnum = pgEnum(
  "event_assignment_status",
  [
    "PENDING",
    "ACCEPTED",
    "DECLINED",
  ],
);

export const attendanceStatusEnum = pgEnum(
  "attendance_status",
  [
    "PRESENT",
    "ABSENT",
  ],
);

export const recruitmentDriveStatusEnum = pgEnum(
  "recruitment_drive_status",
  [
    "DRAFT",
    "OPEN",
    "CLOSED",
    "CANCELLED",
  ],
);

export const applicationStatusEnum = pgEnum(
  "application_status",
  [
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "REJECTED",
    "SELECTED",
    "WITHDRAWN",
  ],
);
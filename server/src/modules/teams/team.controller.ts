import type {
  Request,
  Response,
} from "express";

import {
  assignPrimaryTeam,
  createTeam,
  getTeamHistory,
  getTeamsForClub,
  assignTeamLead,
  getTeamLeads,
  removeTeamLead,
} from "./team.service.js";

import {
  assignPrimaryTeamSchema,
  createTeamSchema,
} from "./team.validation.js";

export async function listTeams(
  req: Request<{ clubId: string }>,
  res: Response,
) {
  const clubTeams =
    await getTeamsForClub(
      req.params.clubId,
    );

  return res.status(200).json({
    teams: clubTeams,
  });
}

export async function createClubTeam(
  req: Request<{ clubId: string }>,
  res: Response,
) {
  const parsed =
    createTeamSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid team data.",
        details:
          parsed.error.flatten(),
      },
    });
  }

  try {
    const team =
      await createTeam(
        req.params.clubId,
        parsed.data,
      );

    return res.status(201).json({
      team,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TEAM_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        error: {
          code: "TEAM_ALREADY_EXISTS",
          message:
            "A team with this name already exists in the club.",
        },
      });
    }

    throw error;
  }
}

export async function assignMemberPrimaryTeam(
  req: Request<{
    clubId: string;
    membershipId: string;
  }>,
  res: Response,
) {
  const parsed =
    assignPrimaryTeamSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message:
          "Invalid team assignment.",
      },
    });
  }

  try {
    const result =
      await assignPrimaryTeam(
        req.params.clubId,
        req.params.membershipId,
        parsed.data.teamId,
      );

    return res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "MEMBERSHIP_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code: "MEMBERSHIP_NOT_FOUND",
          message:
            "Membership not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message === "TEAM_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code: "TEAM_NOT_FOUND",
          message:
            "Team not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message === "MEMBERSHIP_NOT_ACTIVE"
    ) {
      return res.status(409).json({
        error: {
          code: "MEMBERSHIP_NOT_ACTIVE",
          message:
            "Only active members can be assigned to teams.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message === "TEAM_ARCHIVED"
    ) {
      return res.status(409).json({
        error: {
          code: "TEAM_ARCHIVED",
          message:
            "Archived teams cannot receive members.",
        },
      });
    }

    throw error;
  }
}

export async function listMemberTeamHistory(
  req: Request<{
    clubId: string;
    membershipId: string;
  }>,
  res: Response,
) {
  const history =
    await getTeamHistory(
      req.params.clubId,
      req.params.membershipId,
    );

  return res.status(200).json({
    history,
  });
}

export async function addTeamLead(
  req: Request<{
    clubId: string;
    teamId: string;
    membershipId: string;
  }>,
  res: Response,
) {
  try {
    const result =
      await assignTeamLead(
        req.params.clubId,
        req.params.teamId,
        req.params.membershipId,
      );

    return res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "MEMBERSHIP_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "MEMBERSHIP_NOT_FOUND",
          message:
            "Membership not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "MEMBERSHIP_NOT_ACTIVE"
    ) {
      return res.status(409).json({
        error: {
          code:
            "MEMBERSHIP_NOT_ACTIVE",
          message:
            "Only active members can become team leads.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message === "TEAM_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code: "TEAM_NOT_FOUND",
          message: "Team not found.",
        },
      });
    }

    if (
      error instanceof Error &&
      error.message === "TEAM_ARCHIVED"
    ) {
      return res.status(409).json({
        error: {
          code: "TEAM_ARCHIVED",
          message:
            "Archived teams cannot receive new leads.",
        },
      });
    }

    throw error;
  }
}

export async function deleteTeamLead(
  req: Request<{
    clubId: string;
    teamId: string;
    membershipId: string;
  }>,
  res: Response,
) {
  try {
    const assignment =
      await removeTeamLead(
        req.params.clubId,
        req.params.teamId,
        req.params.membershipId,
      );

    return res.status(200).json({
      assignment,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "TEAM_LEAD_ASSIGNMENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        error: {
          code:
            "TEAM_LEAD_ASSIGNMENT_NOT_FOUND",
          message:
            "Active team lead assignment not found.",
        },
      });
    }

    throw error;
  }
}

export async function listTeamLeads(
  req: Request<{
    clubId: string;
    teamId: string;
  }>,
  res: Response,
) {
  const leads =
    await getTeamLeads(
      req.params.clubId,
      req.params.teamId,
    );

  return res.status(200).json({
    leads,
  });
}
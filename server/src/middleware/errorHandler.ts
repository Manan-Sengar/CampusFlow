import type {
  ErrorRequestHandler,
} from "express";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  const bodyParserError = error as SyntaxError & {
    type?: string;
  };

  if (
    bodyParserError instanceof SyntaxError &&
    bodyParserError.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message:
          "Request body contains invalid JSON.",
      },
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred.",
    },
  });
};
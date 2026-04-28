import { AnyZodObject } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/apiResponse';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      return next();
    } catch (error: unknown) {
      const zodError = error as { errors?: unknown[] };
      const firstIssue = zodError.errors?.[0] as { message?: string } | undefined;
      return res
        .status(400)
        .json(errorResponse(
          firstIssue?.message ? `Validation failed: ${firstIssue.message}` : 'Validation failed',
          zodError.errors ?? []
        ));
    }
  };
};

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
      return res
        .status(400)
        .json(errorResponse('Validation failed', zodError.errors ?? []));
    }
  };
};

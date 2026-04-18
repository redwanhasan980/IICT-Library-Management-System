import { AnyZodObject } from 'zod';
import { NextFunction, Request, Response } from 'express';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      return next();
    } catch (error: any) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: error?.errors ?? [],
      });
    }
  };
};

import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/AppError';
import { errorResponse } from '../utils/apiResponse';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(errorResponse(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (error instanceof AppError) {
    res.status(error.statusCode).json(errorResponse(error.message));
    return;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = isProduction
      ? 'Internal server error'
      : (error as Error).message;
    res.status(500).json(errorResponse(message));
    return;
  }

  res.status(500).json(errorResponse('Internal server error'));
};

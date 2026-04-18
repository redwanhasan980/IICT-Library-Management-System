import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { errorResponse } from '../utils/apiResponse';

interface BaseUserProfile {
  id: string;
}

export interface AuthUser {
  id: string;
  role: Role;
  studentProfile?: BaseUserProfile;
  adminProfile?: BaseUserProfile;
  teacherProfile?: BaseUserProfile;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Temporary auth bridge: allows local development while auth module is pending.
  // Real JWT verification should replace this middleware.
  const roleHeader = req.header('x-user-role') as Role | undefined;
  const userIdHeader = req.header('x-user-id');

  if (!roleHeader || !userIdHeader) {
    return res
      .status(401)
      .json(
        errorResponse(
          'Unauthorized. Provide x-user-id and x-user-role headers for development access.'
        )
      );
  }

  const normalizedRole = String(roleHeader).toUpperCase();
  if (!Object.values(Role).includes(normalizedRole as Role)) {
    return res.status(400).json(errorResponse('Invalid role in x-user-role header.'));
  }

  const role = normalizedRole as Role;
  req.user = {
    id: userIdHeader,
    role,
    studentProfile: role === Role.STUDENT ? { id: userIdHeader } : undefined,
    adminProfile: role === Role.ADMIN ? { id: userIdHeader } : undefined,
    teacherProfile: role === Role.TEACHER ? { id: userIdHeader } : undefined,
  };

  return next();
};

export const restrictTo = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(errorResponse('Forbidden'));
    }

    return next();
  };
};

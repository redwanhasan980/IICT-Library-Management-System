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

import prisma from '../config/database';

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const roleHeader = req.header('x-user-role') as Role | undefined;
    const userIdHeader = req.header('x-user-id');

    if (!roleHeader || !userIdHeader) {
      return res.status(401).json(errorResponse('Unauthorized. Provide x-user-id and x-user-role headers for development access.'));
    }

    const normalizedRole = String(roleHeader).toUpperCase();
    if (!Object.values(Role).includes(normalizedRole as Role)) {
      return res.status(400).json(errorResponse('Invalid role in x-user-role header.'));
    }

    const role = normalizedRole as Role;

    // Auto-provision dev user in DB if it doesn't exist
    let user = await prisma.user.findUnique({ where: { email: userIdHeader } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userIdHeader,
          name: userIdHeader.split('@')[0],
          password: 'mock_password',
          role: role,
        }
      });
    }

    // Auto-provision appropriate profile
    let studentProfile, adminProfile, teacherProfile;

    if (role === Role.STUDENT) {
      studentProfile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!studentProfile) {
        studentProfile = await prisma.studentProfile.create({
          data: {
            userId: user.id,
            studentRegNumber: `REG-${Date.now()}`,
            department: 'SWE',
            currentSemester: 1
          }
        });
      }
    } else if (role === Role.ADMIN) {
      adminProfile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
      if (!adminProfile) {
        adminProfile = await prisma.adminProfile.create({
          data: { userId: user.id }
        });
      }
    } else if (role === Role.TEACHER) {
      teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
      if (!teacherProfile) {
        teacherProfile = await prisma.teacherProfile.create({
          data: {
            userId: user.id,
            teacherId: `TCH-${Date.now()}`,
            department: 'SWE'
          }
        });
      }
    }

    req.user = {
      id: user.id,
      role: user.role,
      studentProfile: studentProfile ? { id: studentProfile.id } : undefined,
      adminProfile: adminProfile ? { id: adminProfile.id } : undefined,
      teacherProfile: teacherProfile ? { id: teacherProfile.id } : undefined,
    };

    return next();
  } catch (error) {
    return next(error);
  }
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

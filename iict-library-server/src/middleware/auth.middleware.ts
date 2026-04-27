import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../config/database';
import { errorResponse } from '../utils/apiResponse';
import type { AuthPayload } from '../services/auth.service';

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

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured');
  }
  return secret || 'development-only-secret-change-me';
};

const isDevHeaderAuthEnabled = () =>
  process.env.ENABLE_DEV_AUTH === 'true' && process.env.NODE_ENV !== 'production';

const attachUser = async (req: AuthenticatedRequest, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: { select: { id: true } },
      admin: { select: { id: true } },
      teacher: { select: { id: true } },
    },
  });

  if (!user || !user.isActive) {
    return false;
  }

  req.user = {
    id: user.id,
    role: user.role,
    studentProfile: user.student ? { id: user.student.id } : undefined,
    adminProfile: user.admin ? { id: user.admin.id } : undefined,
    teacherProfile: user.teacher ? { id: user.teacher.id } : undefined,
  };

  return true;
};

const attachDevHeaderUser = async (req: AuthenticatedRequest) => {
  const roleHeader = req.header('x-user-role') as Role | undefined;
  const userIdHeader = req.header('x-user-id');

  if (!roleHeader || !userIdHeader) {
    return false;
  }

  const normalizedRole = String(roleHeader).toUpperCase();
  if (!Object.values(Role).includes(normalizedRole as Role)) {
    throw new Error('Invalid role in x-user-role header.');
  }

  const role = normalizedRole as Role;
  const email = userIdHeader.trim().toLowerCase();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        password: await bcrypt.hash('mock_password', 12),
        role,
      },
    });
  } else if (user.role !== role) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });
  }

  let studentProfile, adminProfile, teacherProfile;

  if (role === Role.STUDENT) {
    studentProfile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!studentProfile) {
      studentProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentRegNumber: `REG-${Date.now()}`,
          department: 'SWE',
          currentSemester: 1,
        },
      });
    }
  } else if (role === Role.ADMIN) {
    adminProfile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
    if (!adminProfile) {
      adminProfile = await prisma.adminProfile.create({ data: { userId: user.id } });
    }
  } else if (role === Role.TEACHER) {
    teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!teacherProfile) {
      teacherProfile = await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          teacherId: `TCH-${Date.now()}`,
          department: 'SWE',
        },
      });
    }
  }

  req.user = {
    id: user.id,
    role,
    studentProfile: studentProfile ? { id: studentProfile.id } : undefined,
    adminProfile: adminProfile ? { id: adminProfile.id } : undefined,
    teacherProfile: teacherProfile ? { id: teacherProfile.id } : undefined,
  };

  return true;
};

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearer = req.header('authorization');
    const token = bearer?.startsWith('Bearer ')
      ? bearer.slice('Bearer '.length)
      : req.cookies?.auth_token;

    if (token) {
      const decoded = jwt.verify(token, jwtSecret()) as AuthPayload;
      const attached = await attachUser(req, decoded.id);
      if (!attached) {
        return res.status(401).json(errorResponse('Unauthorized'));
      }
      return next();
    }

    if (isDevHeaderAuthEnabled()) {
      const attached = await attachDevHeaderUser(req);
      if (attached) {
        return next();
      }
    }

    return res.status(401).json(errorResponse('Unauthorized'));
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid role in x-user-role header.') {
      return res.status(400).json(errorResponse(error.message));
    }
    return res.status(401).json(errorResponse('Unauthorized'));
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

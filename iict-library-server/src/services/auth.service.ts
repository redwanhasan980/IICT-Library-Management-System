import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Department, Role, User } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, 'STUDENT' | 'TEACHER'>;
  studentRegNumber?: string;
  phoneNumber?: string;
  teacherId?: string;
  department: Department;
  currentSemester?: number;
  designation?: string;
  signatureData?: string;
}

interface BootstrapAdminInput {
  setupToken: string;
  name: string;
  email: string;
  password: string;
}

interface UpdateProfileInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  department?: Department;
  currentSemester?: number;
  designation?: string;
  signatureData?: string;
}

interface AuditRequestContext {
  ipAddress?: string;
  userAgent?: string;
}

class AuthService {
  private jwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('JWT_SECRET must be configured', 500);
      }
      return 'development-only-secret-change-me';
    }
    return secret;
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }

  private signToken(user: Pick<User, 'id' | 'email' | 'name' | 'role'>) {
    const payload: AuthPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret(), { expiresIn: TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  }

  async login(email: string, password: string, context: AuditRequestContext = {}) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.isActive) {
      logAuditEvent({
        action: 'auth.login_failure',
        actorId: user?.id,
        actorRole: user?.role,
        entity: 'User',
        entityId: user?.id,
        details: { email: normalizedEmail, reason: user ? 'inactive_user' : 'unknown_user' },
        ...context,
      });
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logAuditEvent({
        action: 'auth.login_failure',
        actorId: user.id,
        actorRole: user.role,
        entity: 'User',
        entityId: user.id,
        details: { email: normalizedEmail, reason: 'invalid_password' },
        ...context,
      });
      throw new AppError('Invalid email or password', 401);
    }

    logAuditEvent({
      action: 'auth.login_success',
      actorId: user.id,
      actorRole: user.role,
      entity: 'User',
      entityId: user.id,
      details: { email: normalizedEmail },
      ...context,
    });

    return {
      user: this.publicUser(user),
      token: this.signToken(user),
    };
  }

  async register(payload: RegisterInput) {
    const email = payload.email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new AppError('A user already exists with this email', 409);
    }

    if (payload.role === Role.STUDENT && payload.studentRegNumber) {
      const existingStudent = await prisma.studentProfile.findUnique({
        where: { studentRegNumber: payload.studentRegNumber },
        select: { id: true },
      });
      if (existingStudent) {
        throw new AppError('A student already exists with this registration number', 409);
      }
    }

    if (payload.role === Role.TEACHER && payload.teacherId) {
      const existingTeacher = await prisma.teacherProfile.findUnique({
        where: { teacherId: payload.teacherId },
        select: { id: true },
      });
      if (existingTeacher) {
        throw new AppError('A teacher already exists with this teacher ID', 409);
      }
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: payload.name.trim(),
          email,
          password: passwordHash,
          role: payload.role,
        },
      });

      if (payload.role === Role.STUDENT) {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentRegNumber: payload.studentRegNumber,
            phoneNumber: payload.phoneNumber,
            department: payload.department,
            currentSemester: payload.currentSemester,
          },
        });
      }

      if (payload.role === Role.TEACHER) {
        await tx.teacherProfile.create({
          data: {
            userId: user.id,
            teacherId: payload.teacherId,
            department: payload.department,
            designation: payload.designation,
            signatureData: payload.signatureData,
          },
        });
      }

      return user;
    });

    return {
      user: this.publicUser(created),
      token: this.signToken(created),
    };
  }

  async bootstrapAdmin(payload: BootstrapAdminInput) {
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!setupToken || payload.setupToken !== setupToken) {
      throw new AppError('Invalid admin setup token', 403);
    }

    const existingAdmin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    if (existingAdmin) {
      throw new AppError('Admin bootstrap is already completed', 409);
    }

    const email = payload.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(payload.password, 12);

    const admin = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: payload.name.trim(),
          email,
          password: passwordHash,
          role: Role.ADMIN,
        },
      });

      await tx.adminProfile.create({ data: { userId: user.id } });
      return user;
    });

    return {
      user: this.publicUser(admin),
      token: this.signToken(admin),
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found', 404);
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async updateCurrentUser(userId: string, payload: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found', 404);
    }

    const nextEmail = payload.email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });
      if (existingUser && existingUser.id !== user.id) {
        throw new AppError('A user already exists with this email', 409);
      }
    }

    await prisma.$transaction(async (tx) => {
      const userData: { name?: string; email?: string } = {};
      if (payload.name !== undefined) {
        userData.name = payload.name.trim();
      }
      if (nextEmail) {
        userData.email = nextEmail;
      }

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: userData,
        });
      }

      if (user.role === Role.STUDENT) {
        const studentData: { phoneNumber?: string; department?: Department; currentSemester?: number } = {};
        if (payload.phoneNumber !== undefined) {
          studentData.phoneNumber = payload.phoneNumber.trim();
        }
        if (payload.department !== undefined) {
          studentData.department = payload.department;
        }
        if (payload.currentSemester !== undefined) {
          studentData.currentSemester = payload.currentSemester;
        }

        if (Object.keys(studentData).length > 0) {
          if (!user.student) {
            throw new AppError('Student profile not found', 404);
          }
          await tx.studentProfile.update({
            where: { userId: user.id },
            data: studentData,
          });
        }
      }

      if (user.role === Role.TEACHER) {
        const teacherData: { department?: Department; designation?: string; signatureData?: string } = {};
        if (payload.department !== undefined) {
          teacherData.department = payload.department;
        }
        if (payload.designation !== undefined) {
          teacherData.designation = payload.designation.trim();
        }
        if (payload.signatureData !== undefined) {
          teacherData.signatureData = payload.signatureData.trim();
        }

        if (Object.keys(teacherData).length > 0) {
          if (!user.teacher) {
            throw new AppError('Teacher profile not found', 404);
          }
          await tx.teacherProfile.update({
            where: { userId: user.id },
            data: teacherData,
          });
        }
      }
    });

    logAuditEvent({
      action: 'auth.profile_update',
      actorId: user.id,
      actorRole: user.role,
      entity: 'User',
      entityId: user.id,
      details: { updatedFields: Object.keys(payload) },
    });

    return this.getCurrentUser(user.id);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });

    logAuditEvent({
      action: 'auth.password_change',
      actorId: user.id,
      actorRole: user.role,
      entity: 'User',
      entityId: user.id,
      details: { changed: true },
    });
  }
}

export default new AuthService();

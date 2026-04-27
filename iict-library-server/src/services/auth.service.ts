import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Department, Role, User } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';

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

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

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
}

export default new AuthService();

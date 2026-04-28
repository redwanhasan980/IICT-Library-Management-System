import bcrypt from 'bcryptjs';
import { Department, Prisma, Role } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';

interface ListUsersQuery {
  q?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

interface UserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
  studentRegNumber?: string;
  phoneNumber?: string;
  teacherId?: string;
  department?: Department;
  currentSemester?: number;
  designation?: string;
  signatureData?: string;
}

class UserService {
  private includeProfiles = {
    student: true,
    teacher: true,
    admin: true,
  };

  private sanitize<T extends { password?: string }>(user: T) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private async ensureProfile(tx: Prisma.TransactionClient, userId: string, role: Role, payload: UserPayload) {
    if (role === Role.ADMIN) {
      await tx.adminProfile.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
      return;
    }

    if (role === Role.STUDENT) {
      if (!payload.studentRegNumber || !payload.phoneNumber || !payload.department) {
        throw new AppError('Student registration number, phone number, and department are required', 400);
      }
      await tx.studentProfile.upsert({
        where: { userId },
        update: {
          studentRegNumber: payload.studentRegNumber,
          phoneNumber: payload.phoneNumber,
          department: payload.department,
          currentSemester: payload.currentSemester,
        },
        create: {
          userId,
          studentRegNumber: payload.studentRegNumber,
          phoneNumber: payload.phoneNumber,
          department: payload.department,
          currentSemester: payload.currentSemester,
        },
      });
      return;
    }

    if (!payload.teacherId || !payload.department) {
      throw new AppError('Teacher ID and department are required', 400);
    }
    await tx.teacherProfile.upsert({
      where: { userId },
      update: {
        teacherId: payload.teacherId,
        department: payload.department,
        designation: payload.designation,
        signatureData: payload.signatureData,
      },
      create: {
        userId,
        teacherId: payload.teacherId,
        department: payload.department,
        designation: payload.designation,
        signatureData: payload.signatureData,
      },
    });
  }

  async listUsers(query: ListUsersQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 20;
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {
      role: query.role,
      isActive: query.isActive,
      OR: query.q
        ? [
            { name: { contains: query.q } },
            { email: { contains: query.q } },
            { student: { studentRegNumber: { contains: query.q } } },
            { teacher: { teacherId: { contains: query.q } } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: this.includeProfiles,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: items.map((user) => this.sanitize(user)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: this.includeProfiles,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.sanitize(user);
  }

  async createUser(payload: Required<Pick<UserPayload, 'name' | 'email' | 'password' | 'role'>> & UserPayload) {
    const email = payload.email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new AppError('A user already exists with this email', 409);
    }

    await this.ensureProfileIdentifiersAvailable(payload);

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: payload.name.trim(),
          email,
          password: passwordHash,
          role: payload.role,
          isActive: payload.isActive ?? true,
        },
      });

      await this.ensureProfile(tx, created.id, payload.role, payload);

      return tx.user.findUniqueOrThrow({
        where: { id: created.id },
        include: this.includeProfiles,
      });
    });

    return this.sanitize(user);
  }

  async updateUser(id: string, payload: UserPayload) {
    const existing = await prisma.user.findUnique({
      where: { id },
      include: this.includeProfiles,
    });
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    const nextRole = payload.role ?? existing.role;
    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 12) : undefined;
    await this.ensureProfileIdentifiersAvailable(payload, id);

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          name: payload.name,
          email: payload.email?.trim().toLowerCase(),
          password: passwordHash,
          role: payload.role,
          isActive: payload.isActive,
        },
      });

      await this.ensureProfile(tx, updated.id, nextRole, {
        studentRegNumber: payload.studentRegNumber ?? existing.student?.studentRegNumber ?? undefined,
        phoneNumber: payload.phoneNumber ?? existing.student?.phoneNumber ?? undefined,
        teacherId: payload.teacherId ?? existing.teacher?.teacherId ?? undefined,
        department: payload.department ?? existing.student?.department ?? existing.teacher?.department ?? undefined,
        currentSemester: payload.currentSemester ?? existing.student?.currentSemester ?? undefined,
        designation: payload.designation ?? existing.teacher?.designation ?? undefined,
        signatureData: payload.signatureData ?? existing.teacher?.signatureData ?? undefined,
      });

      return tx.user.findUniqueOrThrow({
        where: { id },
        include: this.includeProfiles,
      });
    });

    return this.sanitize(user);
  }

  async setActiveStatus(id: string, isActive: boolean) {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: this.includeProfiles,
    });

    return this.sanitize(user);
  }

  private async ensureProfileIdentifiersAvailable(payload: UserPayload, currentUserId?: string) {
    if (payload.studentRegNumber) {
      const existingStudent = await prisma.studentProfile.findUnique({
        where: { studentRegNumber: payload.studentRegNumber },
        select: { userId: true },
      });
      if (existingStudent && existingStudent.userId !== currentUserId) {
        throw new AppError('A student already exists with this registration number', 409);
      }
    }

    if (payload.teacherId) {
      const existingTeacher = await prisma.teacherProfile.findUnique({
        where: { teacherId: payload.teacherId },
        select: { userId: true },
      });
      if (existingTeacher && existingTeacher.userId !== currentUserId) {
        throw new AppError('A teacher already exists with this teacher ID', 409);
      }
    }

    if (payload.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: payload.email.trim().toLowerCase() },
        select: { id: true },
      });
      if (existingUser && existingUser.id !== currentUserId) {
        throw new AppError('A user already exists with this email', 409);
      }
    }
  }
}

export default new UserService();

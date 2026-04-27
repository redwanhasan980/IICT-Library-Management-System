import prisma from '../config/database';
import type { Department, OutsideBookEntryStatus } from '@prisma/client';

class OutsideBookRepository {
  async create(
    studentId: string,
    title: string,
    author: string,
    snapshot?: {
      studentRegNumber?: string;
      studentDepartment?: 'CSE' | 'SWE' | 'EEE';
      studentSemester?: number;
    }
  ) {
    return prisma.outsideBookEntry.create({
      data: {
        studentId,
        title,
        author,
        studentRegNumberSnapshot: snapshot?.studentRegNumber,
        studentDepartmentSnapshot: snapshot?.studentDepartment,
        studentSemesterSnapshot: snapshot?.studentSemester,
      },
    });
  }

  async findById(id: string) {
    return prisma.outsideBookEntry.findUnique({ where: { id } });
  }

  async findByIdWithRelations(id: string) {
    return prisma.outsideBookEntry.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        verifiedByEntry: { include: { user: true } },
        verifiedByExit: { include: { user: true } },
      },
    });
  }

  async findDuplicateActive(studentId: string, title: string) {
    return prisma.outsideBookEntry.findFirst({
      where: {
        studentId,
        entryStatus: 'ENTERED',
        title: {
          equals: title,
        },
      },
      select: { id: true },
    });
  }

  async findByStudent(studentId: string) {
    return prisma.outsideBookEntry.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { entryTime: 'desc' },
    });
  }

  async findActive() {
    return prisma.outsideBookEntry.findMany({
      where: {
        entryStatus: 'ENTERED',
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        verifiedByEntry: {
          include: {
            user: true,
          },
        },
        verifiedByExit: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { entryTime: 'desc' },
    });
  }

  async findAll(params: {
    q?: string;
    status?: OutsideBookEntryStatus;
    verifiedEntry?: boolean;
    verifiedExit?: boolean;
    department?: Department;
    studentRegNumber?: string;
    from?: Date;
    to?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params.status) {
      where.entryStatus = params.status;
    }

    if (params.verifiedEntry !== undefined) {
      where.isVerifiedEntry = params.verifiedEntry;
    }

    if (params.verifiedExit !== undefined) {
      where.isVerifiedExit = params.verifiedExit;
    }

    if (params.department) {
      where.studentDepartmentSnapshot = params.department;
    }

    if (params.studentRegNumber) {
      where.studentRegNumberSnapshot = {
        contains: params.studentRegNumber,
      };
    }

    if (params.from || params.to) {
      where.entryTime = {
        gte: params.from,
        lte: params.to,
      };
    }

    if (params.q) {
      where.OR = [
        { title: { contains: params.q } },
        { author: { contains: params.q } },
        { studentRegNumberSnapshot: { contains: params.q } },
        { student: { user: { name: { contains: params.q } } } },
        { student: { user: { email: { contains: params.q } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.outsideBookEntry.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          student: { include: { user: true } },
          verifiedByEntry: { include: { user: true } },
          verifiedByExit: { include: { user: true } },
        },
        orderBy: { entryTime: 'desc' },
      }),
      prisma.outsideBookEntry.count({ where }),
    ]);

    return { items, total };
  }

  async verifyEntry(id: string, adminId: string) {
    return prisma.outsideBookEntry.update({
      where: { id },
      data: {
        isVerifiedEntry: true,
        verifiedByEntryId: adminId,
      },
    });
  }

  async verifyExit(id: string, adminId: string) {
    const now = new Date();

    return prisma.outsideBookEntry.update({
      where: { id },
      data: {
        entryStatus: 'EXITED',
        isVerifiedExit: true,
        verifiedByExitId: adminId,
        studentStrikeMarkedAt: now,
        exitVerifiedAt: now,
        exitTime: now,
      },
    });
  }

  async markExit(id: string) {
    const now = new Date();

    return prisma.outsideBookEntry.update({
      where: { id },
      data: {
        entryStatus: 'EXITED',
        studentStrikeMarkedAt: now,
        exitTime: now,
      },
    });
  }
}

export default new OutsideBookRepository();

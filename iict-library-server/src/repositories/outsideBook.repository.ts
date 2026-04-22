import prisma from '../config/database';

class OutsideBookRepository {
  async create(
    studentId: string,
    title: string,
    author: string,
    snapshot?: {
      studentRegNumber?: string;
      studentDepartment?: 'CSE' | 'SWE' | 'EEE';
    }
  ) {
    return prisma.outsideBookEntry.create({
      data: {
        studentId,
        title,
        author,
        studentRegNumberSnapshot: snapshot?.studentRegNumber,
        studentDepartmentSnapshot: snapshot?.studentDepartment,
      },
    });
  }

  async findById(id: string) {
    return prisma.outsideBookEntry.findUnique({ where: { id } });
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
}

export default new OutsideBookRepository();

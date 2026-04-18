import prisma from '../config/database';

class OutsideBookRepository {
  async create(studentId: string, title: string, author: string) {
    return prisma.outsideBookEntry.create({
      data: {
        studentId,
        title,
        author,
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
        exitTime: null,
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
    return prisma.outsideBookEntry.update({
      where: { id },
      data: {
        isVerifiedExit: true,
        verifiedByExitId: adminId,
        exitTime: new Date(),
      },
    });
  }
}

export default new OutsideBookRepository();

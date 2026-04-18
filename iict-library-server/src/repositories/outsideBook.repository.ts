import prisma from '../config/database';
import { OutsideBookEntry } from '@prisma/client';

class OutsideBookRepository {
  async create(
    studentId: string,
    title: string,
    author: string
  ): Promise<OutsideBookEntry> {
    return prisma.outsideBookEntry.create({
      data: {
        studentId,
        title,
        author,
      },
    });
  }

  async findById(id: string): Promise<OutsideBookEntry | null> {
    return prisma.outsideBookEntry.findUnique({ where: { id } });
  }

  async findByStudent(studentId: string): Promise<OutsideBookEntry[]> {
    return prisma.outsideBookEntry.findMany({
      where: { studentId },
      orderBy: { entryTime: 'desc' },
    });
  }

  async findActive(): Promise<OutsideBookEntry[]> {
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
      },
      orderBy: { entryTime: 'desc' },
    });
  }

  async verifyEntry(id: string, adminId: string): Promise<OutsideBookEntry> {
    return prisma.outsideBookEntry.update({
      where: { id },
      data: {
        isVerifiedEntry: true,
        verifiedByEntryId: adminId,
      },
    });
  }

  async verifyExit(id: string, adminId: string): Promise<OutsideBookEntry> {
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

import OutsideBookRepository from '../repositories/outsideBook.repository';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';
import policyService from './policy.service';

class OutsideBookService {
  private async resolveStudentProfile(profileOrUserId: string) {
    const profile = await prisma.studentProfile.findFirst({
      where: {
        OR: [
          { id: profileOrUserId },
          { userId: profileOrUserId },
        ],
      },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    return profile;
  }

  async createEntry(
    profileOrUserId: string,
    payload: {
      title: string;
      author: string;
      studentRegNumber: string;
      department: 'CSE' | 'SWE' | 'EEE';
      currentSemester: number;
    }
  ) {
    const studentProfile = await this.resolveStudentProfile(profileOrUserId);

    const outsideBookEnabled = await policyService.isOutsideBookEnabled();
    if (!outsideBookEnabled) {
      throw new AppError('Outside book entries are disabled by current library policy', 400);
    }

    const normalizedTitle = payload.title.trim();
    const normalizedAuthor = payload.author.trim();
    const normalizedReg = payload.studentRegNumber.trim();

    const duplicate = await OutsideBookRepository.findDuplicateActive(studentProfile.id, normalizedTitle);
    if (duplicate) {
      throw new AppError('An active outside book entry already exists for this title', 409);
    }

    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        studentRegNumber: normalizedReg,
        department: payload.department,
        currentSemester: payload.currentSemester,
      },
    });

    const created = await OutsideBookRepository.create(studentProfile.id, normalizedTitle, normalizedAuthor, {
      studentRegNumber: normalizedReg,
      studentDepartment: payload.department,
      studentSemester: payload.currentSemester,
    });

    logAuditEvent({
      action: 'outside_book.create',
      actorId: studentProfile.user.id,
      entity: 'OutsideBookEntry',
      entityId: created.id,
      details: { title: normalizedTitle, author: normalizedAuthor },
    });

    return created;
  }

  async getMyEntries(profileOrUserId: string) {
    const studentProfile = await this.resolveStudentProfile(profileOrUserId);
    return OutsideBookRepository.findByStudent(studentProfile.id);
  }

  async getActiveEntries() {
    return OutsideBookRepository.findActive();
  }

  async listEntries(filters: {
    q?: string;
    status?: 'ENTERED' | 'EXITED';
    verifiedEntry?: boolean;
    verifiedExit?: boolean;
    department?: 'CSE' | 'SWE' | 'EEE';
    studentRegNumber?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? Math.min(filters.pageSize, 100) : 20;
    const skip = (page - 1) * pageSize;

    const { items, total } = await OutsideBookRepository.findAll({
      q: filters.q,
      status: filters.status,
      verifiedEntry: filters.verifiedEntry,
      verifiedExit: filters.verifiedExit,
      department: filters.department,
      studentRegNumber: filters.studentRegNumber,
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
      skip,
      take: pageSize,
    });

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getEntryById(entryId: string) {
    const entry = await OutsideBookRepository.findByIdWithRelations(entryId);
    if (!entry) {
      throw new AppError('Outside book entry not found', 404);
    }
    return entry;
  }

  async markExit(entryId: string, studentId: string) {
    const entry = await OutsideBookRepository.findById(entryId);
    if (!entry) {
      throw new AppError('Outside book entry not found', 404);
    }
    if (entry.studentId !== studentId) {
      throw new AppError('You can only update your own outside book entry', 403);
    }
    if (entry.entryStatus === 'EXITED') {
      throw new AppError('Entry has already been marked as exited', 400);
    }

    const updated = await OutsideBookRepository.markExit(entryId);
    logAuditEvent({
      action: 'outside_book.mark_exit',
      actorId: studentId,
      entity: 'OutsideBookEntry',
      entityId: entryId,
    });
    return updated;
  }

  async verifyEntry(entryId: string, adminId: string) {
    const entry = await OutsideBookRepository.findById(entryId);
    if (!entry) {
      throw new AppError('Outside book entry not found', 404);
    }
    if (entry.isVerifiedEntry) {
      throw new AppError('Entry is already verified', 400);
    }
    const updated = await OutsideBookRepository.verifyEntry(entryId, adminId);
    logAuditEvent({
      action: 'outside_book.verify_entry',
      actorId: adminId,
      entity: 'OutsideBookEntry',
      entityId: entryId,
    });
    return updated;
  }

  async verifyExit(entryId: string, adminId: string) {
    const entry = await OutsideBookRepository.findById(entryId);
    if (!entry) {
      throw new AppError('Outside book entry not found', 404);
    }
    if (!entry.isVerifiedEntry) {
      throw new AppError('Cannot verify exit before entry is verified', 400);
    }
    if (entry.isVerifiedExit) {
      throw new AppError('Exit is already verified', 400);
    }
    const updated = await OutsideBookRepository.verifyExit(entryId, adminId);
    logAuditEvent({
      action: 'outside_book.verify_exit',
      actorId: adminId,
      entity: 'OutsideBookEntry',
      entityId: entryId,
    });
    return updated;
  }
}

export default new OutsideBookService();

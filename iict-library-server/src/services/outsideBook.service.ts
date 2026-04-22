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

    if (!profile.department) {
      throw new AppError('Student department is required for outside-book entry', 400);
    }

    return profile;
  }

  async createEntry(profileOrUserId: string, title: string, author: string) {
    const studentProfile = await this.resolveStudentProfile(profileOrUserId);

    const outsideBookEnabled = await policyService.isOutsideBookEnabled();
    if (!outsideBookEnabled) {
      throw new AppError('Outside book entries are disabled by current library policy', 400);
    }

    const created = await OutsideBookRepository.create(studentProfile.id, title, author, {
      studentRegNumber: studentProfile.studentRegNumber ?? undefined,
      studentDepartment: studentProfile.department ?? undefined,
    });

    logAuditEvent({
      action: 'outside_book.create',
      actorId: studentProfile.user.id,
      entity: 'OutsideBookEntry',
      entityId: created.id,
      details: { title, author },
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

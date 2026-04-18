import OutsideBookRepository from '../repositories/outsideBook.repository';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';
import policyService from './policy.service';

class OutsideBookService {
  async createEntry(studentId: string, title: string, author: string) {
    if (!studentId) {
      throw new AppError('User profile not found', 404);
    }

    const outsideBookEnabled = await policyService.isOutsideBookEnabled();
    if (!outsideBookEnabled) {
      throw new AppError('Outside book entries are disabled by current library policy', 400);
    }

    const created = await OutsideBookRepository.create(studentId, title, author);
    logAuditEvent({
      action: 'outside_book.create',
      actorId: studentId,
      entity: 'OutsideBookEntry',
      entityId: created.id,
      details: { title, author },
    });
    return created;
  }

  async getMyEntries(studentId: string) {
    if (!studentId) {
      throw new AppError('User profile not found', 404);
    }
    return OutsideBookRepository.findByStudent(studentId);
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

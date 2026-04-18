import OutsideBookRepository from '../repositories/outsideBook.repository';
import AppError from '../utils/AppError';

class OutsideBookService {
  async createEntry(studentId: string, title: string, author: string) {
    if (!studentId) {
      throw new AppError('User profile not found', 404);
    }
    return OutsideBookRepository.create(studentId, title, author);
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
    return OutsideBookRepository.verifyEntry(entryId, adminId);
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
    return OutsideBookRepository.verifyExit(entryId, adminId);
  }
}

export default new OutsideBookService();

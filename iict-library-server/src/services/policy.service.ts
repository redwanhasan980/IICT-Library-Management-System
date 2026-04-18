import { Role } from '@prisma/client';
import prisma from '../config/database';
import { logAuditEvent } from '../utils/auditLog';

interface PolicyUpdateInput {
  studentBorrowDurationDays?: number;
  teacherBorrowDurationDays?: number;
  maxActiveLoansStudent?: number;
  maxActiveLoansTeacher?: number;
  finePerDay?: number;
  reservationExpiryHours?: number;
  outsideBookEnabled?: boolean;
}

class PolicyService {
  async getSettings() {
    return prisma.systemSetting.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  async updateSettings(actorId: string, payload: PolicyUpdateInput) {
    const updated = await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: {
        ...payload,
        finePerDay: payload.finePerDay,
        updatedById: actorId,
      },
      create: {
        id: 1,
        ...payload,
        finePerDay: payload.finePerDay,
        updatedById: actorId,
      },
    });

    logAuditEvent({
      action: 'policy.update',
      actorId,
      entity: 'SystemSetting',
      entityId: '1',
      details: { ...payload },
    });

    return updated;
  }

  async getBorrowDurationByRole(role: Role) {
    const settings = await this.getSettings();
    return role === Role.TEACHER
      ? settings.teacherBorrowDurationDays
      : settings.studentBorrowDurationDays;
  }

  async getMaxActiveLoansByRole(role: Role) {
    const settings = await this.getSettings();
    return role === Role.TEACHER
      ? settings.maxActiveLoansTeacher
      : settings.maxActiveLoansStudent;
  }

  async getReservationExpiryHours() {
    const settings = await this.getSettings();
    return settings.reservationExpiryHours;
  }

  async isOutsideBookEnabled() {
    const settings = await this.getSettings();
    return settings.outsideBookEnabled;
  }
}

export default new PolicyService();

import { ReservationStatus, Role } from '@prisma/client';
import prisma from '../config/database';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';
import policyService from './policy.service';

const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.FULFILLED,
];

class ReservationService {
  private async expireOverdueFulfilledReservations() {
    const now = new Date();
    await prisma.reservation.updateMany({
      where: {
        status: ReservationStatus.FULFILLED,
        expiresAt: { lte: now },
      },
      data: {
        status: ReservationStatus.EXPIRED,
        expiredAt: now,
      },
    });
  }

  async createReservation(userId: string, role: Role, bookId: string) {
    if (role !== Role.STUDENT && role !== Role.TEACHER) {
      throw new AppError('Only students and teachers can place reservations', 403);
    }

    await this.expireOverdueFulfilledReservations();

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.isArchived) {
      throw new AppError('Book not found', 404);
    }

    if (book.availableCopies > 0) {
      throw new AppError('Book is currently available, no reservation needed', 400);
    }

    const existing = await prisma.reservation.findFirst({
      where: {
        userId,
        bookId,
        status: { in: ACTIVE_RESERVATION_STATUSES },
      },
    });

    if (existing) {
      throw new AppError('You already have an active reservation for this book', 409);
    }

    const maxQueue = await prisma.reservation.aggregate({
      where: { bookId, status: ReservationStatus.PENDING },
      _max: { queueNumber: true },
    });

    const queueNumber = (maxQueue._max.queueNumber ?? 0) + 1;

    const created = await prisma.reservation.create({
      data: {
        bookId,
        userId,
        queueNumber,
        status: ReservationStatus.PENDING,
      },
      include: {
        book: true,
      },
    });

    logAuditEvent({
      action: 'reservation.create',
      actorId: userId,
      entity: 'Reservation',
      entityId: created.id,
      details: { bookId, queueNumber },
    });

    return created;
  }

  async cancelMyReservation(userId: string, reservationId: string) {
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    if (reservation.userId !== userId) {
      throw new AppError('You can only cancel your own reservation', 403);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new AppError('Only pending reservations can be cancelled', 400);
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    logAuditEvent({
      action: 'reservation.cancel',
      actorId: userId,
      entity: 'Reservation',
      entityId: reservationId,
    });

    return updated;
  }

  async listMyReservations(userId: string) {
    await this.expireOverdueFulfilledReservations();

    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reservations.map((item) => ({
      ...item,
      queuePosition: item.status === ReservationStatus.PENDING ? item.queueNumber : null,
    }));
  }

  async listReservationsForBook(bookId: string) {
    await this.expireOverdueFulfilledReservations();

    return prisma.reservation.findMany({
      where: { bookId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: [{ status: 'asc' }, { queueNumber: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async listPendingForAdmin() {
    await this.expireOverdueFulfilledReservations();

    return prisma.reservation.findMany({
      where: { status: ReservationStatus.PENDING },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        book: true,
      },
      orderBy: [{ createdAt: 'asc' }],
    });
  }

  async updateReservationStatusByAdmin(actorId: string, reservationId: string, status: ReservationStatus) {
    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    const now = new Date();
    const data: {
      status: ReservationStatus;
      fulfilledAt?: Date;
      cancelledAt?: Date;
      expiredAt?: Date;
      expiresAt?: Date;
    } = { status };

    if (status === ReservationStatus.FULFILLED) {
      const expiryHours = await policyService.getReservationExpiryHours();
      data.fulfilledAt = now;
      data.expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);
    }

    if (status === ReservationStatus.CANCELLED) {
      data.cancelledAt = now;
    }

    if (status === ReservationStatus.EXPIRED) {
      data.expiredAt = now;
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        book: true,
      },
    });

    logAuditEvent({
      action: 'reservation.update_status',
      actorId,
      entity: 'Reservation',
      entityId: reservationId,
      details: { status },
    });

    return updated;
  }

  async fulfillNextPendingReservation(bookId: string, actorId: string) {
    const now = new Date();
    const nextReservation = await prisma.reservation.findFirst({
      where: {
        bookId,
        status: ReservationStatus.PENDING,
      },
      orderBy: [{ queueNumber: 'asc' }, { createdAt: 'asc' }],
    });

    if (!nextReservation) {
      return null;
    }

    const expiryHours = await policyService.getReservationExpiryHours();

    const updated = await prisma.reservation.update({
      where: { id: nextReservation.id },
      data: {
        status: ReservationStatus.FULFILLED,
        fulfilledAt: now,
        expiresAt: new Date(now.getTime() + expiryHours * 60 * 60 * 1000),
      },
    });

    logAuditEvent({
      action: 'reservation.auto_fulfill_after_return',
      actorId,
      entity: 'Reservation',
      entityId: updated.id,
      details: { bookId },
    });

    return updated;
  }
}

export default new ReservationService();

import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import reservationService from '../services/reservation.service';

class ReservationController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const reservation = await reservationService.createReservation(userId, role, req.body.bookId);
      return res.status(201).json(successResponse(reservation, 'Reservation created'));
    } catch (error) {
      return next(error);
    }
  }

  async cancelMyReservation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const reservation = await reservationService.cancelMyReservation(userId, req.params.id);
      return res.status(200).json(successResponse(reservation, 'Reservation cancelled'));
    } catch (error) {
      return next(error);
    }
  }

  async listMyReservations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const reservations = await reservationService.listMyReservations(userId);
      return res.status(200).json(successResponse(reservations));
    } catch (error) {
      return next(error);
    }
  }

  async listForBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rows = await reservationService.listReservationsForBook(req.params.bookId);
      return res.status(200).json(successResponse(rows));
    } catch (error) {
      return next(error);
    }
  }

  async listPending(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rows = await reservationService.listPendingForAdmin();
      return res.status(200).json(successResponse(rows));
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const updated = await reservationService.updateReservationStatusByAdmin(
        actorId,
        req.params.id,
        req.body.status
      );
      return res.status(200).json(successResponse(updated, 'Reservation status updated'));
    } catch (error) {
      return next(error);
    }
  }
}

export default new ReservationController();

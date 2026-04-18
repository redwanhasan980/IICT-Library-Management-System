import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import fineService from '../services/fine.service';

class FineController {
  async getMySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const summary = await fineService.getFineSummaryForUser(userId);
      return res.status(200).json(successResponse(summary));
    } catch (error) {
      return next(error);
    }
  }

  async getUserSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = await fineService.getFineSummaryForUser(req.params.userId);
      return res.status(200).json(successResponse(summary));
    } catch (error) {
      return next(error);
    }
  }

  async getTransactionFineDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      const actorRole = req.user?.role;
      if (!actorId || !actorRole) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const details = await fineService.getFineDetailsForTransaction(req.params.loanId, {
        id: actorId,
        role: actorRole,
      });

      return res.status(200).json(successResponse(details));
    } catch (error) {
      return next(error);
    }
  }

  async listUnpaidOrPartiallyPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const rows = await fineService.listUnpaidOrPartialFines({
        q: req.query.q as string | undefined,
        role: req.query.role as 'STUDENT' | 'TEACHER' | undefined,
      });
      return res.status(200).json(successResponse(rows));
    } catch (error) {
      return next(error);
    }
  }

  async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const payment = await fineService.recordFinePayment(actorId, req.body);
      return res.status(201).json(successResponse(payment, 'Fine payment recorded'));
    } catch (error) {
      return next(error);
    }
  }

  async paymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      const actorRole = req.user?.role;
      if (!actorId || !actorRole) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const history = await fineService.getPaymentHistory({
        userId: req.query.userId as string | undefined,
        loanId: req.query.loanId as string | undefined,
      }, {
        id: actorId,
        role: actorRole,
      });

      return res.status(200).json(successResponse(history));
    } catch (error) {
      return next(error);
    }
  }
}

export default new FineController();

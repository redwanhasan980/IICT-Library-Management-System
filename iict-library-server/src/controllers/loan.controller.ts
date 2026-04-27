import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import loanService from '../services/loan.service';

class LoanController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const loans = await loanService.listLoans({
        status: req.query.status as never,
        overdue: req.query.overdue === 'true' ? true : req.query.overdue === 'false' ? false : undefined,
        borrowerRole: req.query.borrowerRole as never,
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      return res.status(200).json(successResponse(loans));
    } catch (error) {
      return next(error);
    }
  }

  async issue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const loan = await loanService.issueLoan({
        ...req.body,
        issuedById: actorId,
      });

      return res.status(201).json(successResponse(loan, 'Loan issued'));
    } catch (error) {
      return next(error);
    }
  }

  async returnLoan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const loan = await loanService.returnLoan(req.params.id, actorId);
      return res.status(200).json(successResponse(loan, 'Loan returned'));
    } catch (error) {
      return next(error);
    }
  }

  async listMyLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const loans = await loanService.listMyLoans(userId);
      return res.status(200).json(successResponse(loans));
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actor = req.user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const loan = await loanService.getLoanById(req.params.id, actor);
      return res.status(200).json(successResponse(loan));
    } catch (error) {
      return next(error);
    }
  }

  async myHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const loans = await loanService.listMyLoans(userId);
      return res.status(200).json(successResponse(loans));
    } catch (error) {
      return next(error);
    }
  }

  async borrowerHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const loans = await loanService.listBorrowerHistory(req.params.userId);
      return res.status(200).json(successResponse(loans));
    } catch (error) {
      return next(error);
    }
  }

  async bookHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const loans = await loanService.listBookHistory(req.params.bookId);
      return res.status(200).json(successResponse(loans));
    } catch (error) {
      return next(error);
    }
  }

  async lookupByAccession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loanService.lookupBookAndActiveLoanByAccession(req.params.accessionNumber);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }
}

export default new LoanController();

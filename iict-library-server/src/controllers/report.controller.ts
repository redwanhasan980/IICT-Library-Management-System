import { NextFunction, Request, Response } from 'express';
import { LoanStatus, Role } from '@prisma/client';
import reportService from '../services/report.service';
import { successResponse } from '../utils/apiResponse';

class ReportController {
  async issuedBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getIssuedBooksReport({
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        status: req.query.status as LoanStatus | 'ALL' | undefined,
        borrowerRole: req.query.borrowerRole as Role | undefined,
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }
}

export default new ReportController();

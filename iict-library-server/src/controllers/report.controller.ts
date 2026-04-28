import { NextFunction, Response } from 'express';
import { LoanStatus, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import reportService from '../services/report.service';
import { successResponse } from '../utils/apiResponse';
import { logAuditEvent } from '../utils/auditLog';

class ReportController {
  async issuedBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

      logAuditEvent({
        action: 'report.issued_books.generate',
        actorId: req.user?.id,
        actorRole: req.user?.role,
        entity: 'Report',
        entityId: 'issued-books',
        details: {
          filters: req.query,
          rows: result.items.length,
          total: result.total,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }
}

export default new ReportController();

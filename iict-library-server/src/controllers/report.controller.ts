import { NextFunction, Response } from 'express';
import { Department, LoanStatus, OutsideBookEntryStatus, ProcurementStatus, Role, ShelvingStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import reportService from '../services/report.service';
import { successResponse } from '../utils/apiResponse';
import { logAuditEvent } from '../utils/auditLog';

const logReportGenerated = (
  req: AuthenticatedRequest,
  reportName: string,
  result: { items: unknown[]; total: number }
) => {
  logAuditEvent({
    action: `report.${reportName}.generate`,
    actorId: req.user?.id,
    actorRole: req.user?.role,
    entity: 'Report',
    entityId: reportName,
    details: {
      filters: req.query,
      rows: result.items.length,
      total: result.total,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });
};

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

      logReportGenerated(req, 'issued_books', result);

      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async returnedBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getReturnedBooksReport({
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        borrowerRole: req.query.borrowerRole as Role | undefined,
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      logReportGenerated(req, 'returned_books', result);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async overdueLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getOverdueLoansReport({
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        borrowerRole: req.query.borrowerRole as Role | undefined,
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      logReportGenerated(req, 'overdue_loans', result);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async outsideBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getOutsideBooksReport({
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        status: req.query.status as OutsideBookEntryStatus | 'ALL' | undefined,
        department: req.query.department as Department | undefined,
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      logReportGenerated(req, 'outside_books', result);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async catalogInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getCatalogInventoryReport({
        q: req.query.q as string | undefined,
        department: req.query.department as Department | undefined,
        includeArchived: req.query.includeArchived === 'true',
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      logReportGenerated(req, 'catalog_inventory', result);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async procurementSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getProcurementSummaryReport({
        q: req.query.q as string | undefined,
        procurementStatus: req.query.procurementStatus as ProcurementStatus | undefined,
        shelvingStatus: req.query.shelvingStatus as ShelvingStatus | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      logReportGenerated(req, 'procurement_summary', result);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async auditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getAuditLogReport({
        q: req.query.q as string | undefined,
        actorId: req.query.actorId as string | undefined,
        action: req.query.action as string | undefined,
        entityType: req.query.entityType as string | undefined,
        entityId: req.query.entityId as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      logReportGenerated(req, 'audit_logs', result);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }
}

export default new ReportController();

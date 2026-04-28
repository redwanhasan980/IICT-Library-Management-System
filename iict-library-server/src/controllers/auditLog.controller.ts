import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import auditLogService from '../services/auditLog.service';
import { successResponse } from '../utils/apiResponse';

class AuditLogController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await auditLogService.list({
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

      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }
}

export default new AuditLogController();

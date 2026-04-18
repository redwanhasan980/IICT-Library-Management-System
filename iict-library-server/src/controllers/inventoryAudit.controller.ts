import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import inventoryAuditService from '../services/inventoryAudit.service';

type InventoryAuditResultStatus =
  | 'FOUND'
  | 'MISSING'
  | 'EXTRA_OR_UNMATCHED'
  | 'ISSUED_DURING_AUDIT'
  | 'INACTIVE_OR_ARCHIVED';

class InventoryAuditController {
  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const session = await inventoryAuditService.createSession(actorId, req.body.title, req.body.notes);
      return res.status(201).json(successResponse(session, 'Inventory audit session created'));
    } catch (error) {
      return next(error);
    }
  }

  async listSessions(_req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await inventoryAuditService.listSessions();
      return res.status(200).json(successResponse(sessions));
    } catch (error) {
      return next(error);
    }
  }

  async getSessionDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await inventoryAuditService.getSessionDetails(req.params.id);
      return res.status(200).json(successResponse(session));
    } catch (error) {
      return next(error);
    }
  }

  async addScan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const scan = await inventoryAuditService.addScan(req.params.id, actorId, req.body.accessionNumber);
      return res.status(201).json(successResponse(scan, 'Scan added'));
    } catch (error) {
      return next(error);
    }
  }

  async bulkAddScans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await inventoryAuditService.bulkAddScans(req.params.id, actorId, req.body.accessionNumbers);
      return res.status(200).json(successResponse(result, 'Bulk scans added'));
    } catch (error) {
      return next(error);
    }
  }

  async closeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const session = await inventoryAuditService.closeSession(req.params.id, actorId);
      return res.status(200).json(successResponse(session, 'Audit session closed'));
    } catch (error) {
      return next(error);
    }
  }

  async listResults(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as InventoryAuditResultStatus | undefined;
      const results = await inventoryAuditService.getAuditResults(req.params.id, status);
      return res.status(200).json(successResponse(results));
    } catch (error) {
      return next(error);
    }
  }
}

export default new InventoryAuditController();

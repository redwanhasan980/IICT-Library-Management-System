import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import bulkService from '../services/bulk.service';

class BulkController {
  async importBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await bulkService.importBooksCsv(actorId, req.body.csv);
      return res.status(200).json(successResponse(result, 'Book import completed'));
    } catch (error) {
      return next(error);
    }
  }

  async exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const resource = req.params.resource as 'books' | 'loans' | 'outside-books' | 'members';
      const csv = await bulkService.exportCsv(actorId, resource);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${resource}-export.csv`);
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }
}

export default new BulkController();

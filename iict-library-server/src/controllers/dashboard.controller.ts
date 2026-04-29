import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import dashboardService from '../services/dashboard.service';
import { successResponse } from '../utils/apiResponse';

class DashboardController {
  async home(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.getHomeData();
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async summary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await dashboardService.getSummary(req.user);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }
}

export default new DashboardController();

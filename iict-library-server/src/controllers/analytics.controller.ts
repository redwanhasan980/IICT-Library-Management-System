import { NextFunction, Request, Response } from 'express';
import analyticsService from '../services/analytics.service';
import { successResponse } from '../utils/apiResponse';

class AnalyticsController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = await analyticsService.getDashboard({
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });

      return res.status(200).json(successResponse(payload));
    } catch (error) {
      return next(error);
    }
  }
}

export default new AnalyticsController();

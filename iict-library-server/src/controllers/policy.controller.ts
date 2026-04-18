import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import policyService from '../services/policy.service';

class PolicyController {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await policyService.getSettings();
      return res.status(200).json(successResponse(settings));
    } catch (error) {
      return next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const settings = await policyService.updateSettings(actorId, req.body);
      return res.status(200).json(successResponse(settings, 'Settings updated'));
    } catch (error) {
      return next(error);
    }
  }
}

export default new PolicyController();

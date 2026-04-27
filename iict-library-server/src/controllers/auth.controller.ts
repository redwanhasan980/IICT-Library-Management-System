import { NextFunction, Response } from 'express';
import authService from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

class AuthController {
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.cookie('auth_token', result.token, cookieOptions);
      return res.status(200).json(successResponse(result, 'Login successful'));
    } catch (error) {
      return next(error);
    }
  }

  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie('auth_token', result.token, cookieOptions);
      return res.status(201).json(successResponse(result, 'Registration successful'));
    } catch (error) {
      return next(error);
    }
  }

  async bootstrapAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.bootstrapAdmin(req.body);
      res.cookie('auth_token', result.token, cookieOptions);
      return res.status(201).json(successResponse(result, 'Admin account created'));
    } catch (error) {
      return next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await authService.getCurrentUser(userId);
      return res.status(200).json(successResponse(user));
    } catch (error) {
      return next(error);
    }
  }

  async logout(_req: AuthenticatedRequest, res: Response) {
    res.clearCookie('auth_token', cookieOptions);
    return res.status(200).json(successResponse(null, 'Logged out'));
  }
}

export default new AuthController();

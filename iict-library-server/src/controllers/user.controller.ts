import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import userService from '../services/user.service';
import { successResponse } from '../utils/apiResponse';

class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.listUsers({
        q: req.query.q as string | undefined,
        role: req.query.role as Role | undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUser(req.params.id);
      return res.status(200).json(successResponse(user));
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).json(successResponse(user, 'User created'));
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json(successResponse(user, 'User updated'));
    } catch (error) {
      return next(error);
    }
  }

  async setActiveStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.setActiveStatus(req.params.id, req.body.isActive);
      return res.status(200).json(successResponse(user, 'User status updated'));
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();

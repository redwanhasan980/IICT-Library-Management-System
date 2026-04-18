import { Request, Response, NextFunction } from 'express';
import OutsideBookService from '../services/outsideBook.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

class OutsideBookController {
  async createEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, author } = req.body;
      const studentId = req.user?.studentProfile?.id;
      if (!studentId) {
        return res.status(403).json({ message: 'Only students can perform this action' });
      }
      const entry = await OutsideBookService.createEntry(studentId, title, author);
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  }

  async getMyEntries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.studentProfile?.id;
      if (!studentId) {
        return res.status(403).json({ message: 'Only students can perform this action' });
      }
      const entries = await OutsideBookService.getMyEntries(studentId);
      res.status(200).json(entries);
    } catch (error) {
      next(error);
    }
  }

  async getActiveEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const entries = await OutsideBookService.getActiveEntries();
      res.status(200).json(entries);
    } catch (error) {
      next(error);
    }
  }

  async verifyEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.adminProfile?.id;
      if (!adminId) {
        return res.status(403).json({ message: 'Only admins can perform this action' });
      }
      const entry = await OutsideBookService.verifyEntry(id, adminId);
      res.status(200).json(entry);
    } catch (error) {
      next(error);
    }
  }

  async verifyExit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.adminProfile?.id;
      if (!adminId) {
        return res.status(403).json({ message: 'Only admins can perform this action' });
      }
      const entry = await OutsideBookService.verifyExit(id, adminId);
      res.status(200).json(entry);
    } catch (error) {
      next(error);
    }
  }
}

export default new OutsideBookController();

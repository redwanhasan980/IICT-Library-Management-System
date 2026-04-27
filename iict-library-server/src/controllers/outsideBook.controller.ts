import { Request, Response, NextFunction } from 'express';
import OutsideBookService from '../services/outsideBook.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { errorResponse, successResponse } from '../utils/apiResponse';

class OutsideBookController {
  async createEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, author, studentRegNumber, department, currentSemester } = req.body;
      const studentId = req.user?.studentProfile?.id;
      if (!studentId) {
        return res.status(403).json(errorResponse('Only students can perform this action'));
      }
      const entry = await OutsideBookService.createEntry(studentId, {
        title,
        author,
        studentRegNumber,
        department,
        currentSemester,
      });
      res.status(201).json(successResponse(entry, 'Outside book entry created'));
    } catch (error) {
      next(error);
    }
  }

  async getMyEntries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.studentProfile?.id;
      if (!studentId) {
        return res.status(403).json(errorResponse('Only students can perform this action'));
      }
      const entries = await OutsideBookService.getMyEntries(studentId);
      res.status(200).json(successResponse(entries));
    } catch (error) {
      next(error);
    }
  }

  async getActiveEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const entries = await OutsideBookService.getActiveEntries();
      res.status(200).json(successResponse(entries));
    } catch (error) {
      next(error);
    }
  }

  async listEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OutsideBookService.listEntries({
        q: req.query.q as string | undefined,
        status: req.query.status as 'ENTERED' | 'EXITED' | undefined,
        verifiedEntry: req.query.verifiedEntry ? req.query.verifiedEntry === 'true' : undefined,
        verifiedExit: req.query.verifiedExit ? req.query.verifiedExit === 'true' : undefined,
        department: req.query.department as 'CSE' | 'SWE' | 'EEE' | undefined,
        studentRegNumber: req.query.studentRegNumber as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getEntryById(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await OutsideBookService.getEntryById(req.params.id);
      res.status(200).json(successResponse(entry));
    } catch (error) {
      next(error);
    }
  }

  async markExit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.studentProfile?.id;
      if (!studentId) {
        return res.status(403).json(errorResponse('Only students can perform this action'));
      }
      const entry = await OutsideBookService.markExit(req.params.id, studentId);
      res.status(200).json(successResponse(entry, 'Outside book exit recorded'));
    } catch (error) {
      next(error);
    }
  }

  async verifyEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.adminProfile?.id;
      if (!adminId) {
        return res.status(403).json(errorResponse('Only admins can perform this action'));
      }
      const entry = await OutsideBookService.verifyEntry(id, adminId);
      res.status(200).json(successResponse(entry, 'Outside book entry verified'));
    } catch (error) {
      next(error);
    }
  }

  async verifyExit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.adminProfile?.id;
      if (!adminId) {
        return res.status(403).json(errorResponse('Only admins can perform this action'));
      }
      const entry = await OutsideBookService.verifyExit(id, adminId);
      res.status(200).json(successResponse(entry, 'Outside book exit verified'));
    } catch (error) {
      next(error);
    }
  }
}

export default new OutsideBookController();

import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import bookService from '../services/book.service';

class BookController {
  async createBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const created = await bookService.createBook(actorId, req.body);
      return res.status(201).json(successResponse(created, 'Book created'));
    } catch (error) {
      return next(error);
    }
  }

  async listBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.listBooks({
        q: req.query.q as string | undefined,
        includeArchived: req.query.includeArchived === 'true',
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async updateBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const updated = await bookService.updateBook(actorId, req.params.id, req.body);
      return res.status(200).json(successResponse(updated, 'Book updated'));
    } catch (error) {
      return next(error);
    }
  }

  async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.getBookById(req.params.id);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async getByAccession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.getByAccession(req.params.accessionNumber);
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async setArchiveStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const updated = await bookService.setArchiveStatus(actorId, req.params.id, req.body.isArchived);
      return res.status(200).json(successResponse(updated, req.body.isArchived ? 'Book archived' : 'Book re-activated'));
    } catch (error) {
      return next(error);
    }
  }
}

export default new BookController();

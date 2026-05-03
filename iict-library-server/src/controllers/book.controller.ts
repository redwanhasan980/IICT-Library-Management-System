import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { successResponse } from '../utils/apiResponse';
import bookService from '../services/book.service';
import bookImageService from '../services/bookImage.service';

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

  async listPublicBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.listPublicBooks({
        q: req.query.q as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async listRecentBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.listRecentBooks({
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async listPopularBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookService.listPopularBooks({
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });
      return res.status(200).json(successResponse(result));
    } catch (error) {
      return next(error);
    }
  }

  async listRecommendedBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await bookService.listRecommendedBooks(userId, {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
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


  async deleteBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const deleted = await bookService.deleteBook(actorId, req.params.id);
      return res.status(200).json(successResponse(deleted, 'Book permanently deleted'));
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

  async uploadImages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const files = Array.isArray(req.files) ? req.files : [];
      const result = await bookImageService.uploadImages(actorId, req.params.id, files);
      return res.status(201).json(successResponse(result, 'Book images uploaded'));
    } catch (error) {
      return next(error);
    }
  }

  async deleteImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await bookImageService.deleteImage(actorId, req.params.id, req.params.imageId);
      return res.status(200).json(successResponse(result, 'Book image removed'));
    } catch (error) {
      return next(error);
    }
  }

  async reorderImages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await bookImageService.reorderImages(
        actorId,
        req.params.id,
        req.body.imageIds,
        req.body.primaryImageId
      );
      return res.status(200).json(successResponse(result, 'Book images updated'));
    } catch (error) {
      return next(error);
    }
  }
}

export default new BookController();

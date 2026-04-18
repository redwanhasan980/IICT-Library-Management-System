import { Role } from '@prisma/client';
import { Router } from 'express';
import bookController from '../controllers/book.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  accessionParamSchema,
  archiveBookSchema,
  bookIdParamSchema,
  createBookSchema,
  listBooksSchema,
} from '../validators/book.validator';

const router = Router();

router.use(protect);

router.get('/', validate(listBooksSchema), bookController.listBooks);
router.get('/accession/:accessionNumber', validate(accessionParamSchema), bookController.getByAccession);
router.get('/:id', validate(bookIdParamSchema), bookController.getBookById);

router.post('/', restrictTo(Role.ADMIN), validate(createBookSchema), bookController.createBook);
router.patch('/:id/archive', restrictTo(Role.ADMIN), validate(archiveBookSchema), bookController.setArchiveStatus);

export default router;

import { Role } from '@prisma/client';
import { Router } from 'express';
import bookController from '../controllers/book.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  accessionParamSchema,
  archiveBookSchema,
  bookDiscoverySchema,
  bookIdParamSchema,
  createBookSchema,
  listBooksSchema,
  publicListBooksSchema,
  updateBookSchema,
} from '../validators/book.validator';

const router = Router();

router.get('/public', validate(publicListBooksSchema), bookController.listPublicBooks);
router.get('/recent', validate(bookDiscoverySchema), bookController.listRecentBooks);
router.get('/popular', validate(bookDiscoverySchema), bookController.listPopularBooks);

router.use(protect);

router.get('/', validate(listBooksSchema), bookController.listBooks);
router.get('/recommended', validate(bookDiscoverySchema), bookController.listRecommendedBooks);
router.get('/accession/:accessionNumber', validate(accessionParamSchema), bookController.getByAccession);
router.get('/:id', validate(bookIdParamSchema), bookController.getBookById);

router.post('/', restrictTo(Role.ADMIN), validate(createBookSchema), bookController.createBook);
router.put('/:id', restrictTo(Role.ADMIN), validate(updateBookSchema), bookController.updateBook);
router.patch('/:id/archive', restrictTo(Role.ADMIN), validate(archiveBookSchema), bookController.setArchiveStatus);

export default router;

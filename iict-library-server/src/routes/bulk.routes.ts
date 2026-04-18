import { Role } from '@prisma/client';
import { Router } from 'express';
import bulkController from '../controllers/bulk.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { exportResourceSchema, importBooksSchema } from '../validators/bulk.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.post('/import/books', validate(importBooksSchema), bulkController.importBooks);
router.get('/export/:resource', validate(exportResourceSchema), bulkController.exportCsv);

export default router;

import { Role } from '@prisma/client';
import { Router } from 'express';
import reportController from '../controllers/report.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { issuedBooksReportSchema } from '../validators/report.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.get('/issued-books', validate(issuedBooksReportSchema), reportController.issuedBooks);

export default router;

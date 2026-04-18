import { Role } from '@prisma/client';
import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { analyticsDateRangeSchema } from '../validators/analytics.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.get('/dashboard', validate(analyticsDateRangeSchema), analyticsController.getDashboard);

export default router;

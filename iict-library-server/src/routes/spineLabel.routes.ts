import express from 'express';
import { generateSpineLabel } from '../controllers/spineLabel.controller';
import { validate } from '../middleware/validate.middleware';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { generateSpineLabelSchema } from '../validators/spineLabel.validator';
import { Role } from '@prisma/client';

const router = express.Router();

router.use(protect, restrictTo(Role.ADMIN));

router.post(
  '/generate',
  validate(generateSpineLabelSchema),
  generateSpineLabel
);

export default router;

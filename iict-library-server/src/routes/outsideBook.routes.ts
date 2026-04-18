import { Router } from 'express';
import OutsideBookController from '../controllers/outsideBook.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createOutsideBookEntrySchema,
  verifyOutsideBookEntrySchema,
} from '../validators/outsideBook.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(protect);

router.post(
  '/',
  restrictTo(Role.STUDENT),
  validate(createOutsideBookEntrySchema),
  OutsideBookController.createEntry
);

router.get('/my-entries', restrictTo(Role.STUDENT), OutsideBookController.getMyEntries);

router.get(
  '/active',
  restrictTo(Role.ADMIN),
  OutsideBookController.getActiveEntries
);

router.patch(
  '/:id/verify-entry',
  restrictTo(Role.ADMIN),
  validate(verifyOutsideBookEntrySchema),
  OutsideBookController.verifyEntry
);

router.patch(
  '/:id/verify-exit',
  restrictTo(Role.ADMIN),
  validate(verifyOutsideBookEntrySchema),
  OutsideBookController.verifyExit
);

export default router;

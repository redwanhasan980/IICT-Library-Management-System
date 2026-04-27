import { Router } from 'express';
import OutsideBookController from '../controllers/outsideBook.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createOutsideBookEntrySchema,
  exitOutsideBookEntrySchema,
  listOutsideBookEntriesSchema,
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

router.get(
  '/',
  restrictTo(Role.ADMIN),
  validate(listOutsideBookEntriesSchema),
  OutsideBookController.listEntries
);

router.get(
  '/:id',
  restrictTo(Role.ADMIN),
  validate(verifyOutsideBookEntrySchema),
  OutsideBookController.getEntryById
);

router.patch(
  '/:id/exit',
  restrictTo(Role.STUDENT),
  validate(exitOutsideBookEntrySchema),
  OutsideBookController.markExit
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

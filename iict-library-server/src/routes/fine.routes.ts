import { Role } from '@prisma/client';
import { Router } from 'express';
import fineController from '../controllers/fine.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  loanIdParamSchema,
  paymentHistoryQuerySchema,
  recordFinePaymentSchema,
  unpaidFinesQuerySchema,
  userIdParamSchema,
} from '../validators/fine.validator';

const router = Router();

router.use(protect);

router.get('/me/summary', restrictTo(Role.STUDENT, Role.TEACHER), fineController.getMySummary);
router.get('/transactions/:loanId', validate(loanIdParamSchema), fineController.getTransactionFineDetails);
router.get('/payments/history', validate(paymentHistoryQuerySchema), fineController.paymentHistory);

router.get('/users/:userId/summary', restrictTo(Role.ADMIN), validate(userIdParamSchema), fineController.getUserSummary);
router.get('/unpaid', restrictTo(Role.ADMIN), validate(unpaidFinesQuerySchema), fineController.listUnpaidOrPartiallyPaid);
router.post('/payments', restrictTo(Role.ADMIN), validate(recordFinePaymentSchema), fineController.recordPayment);

export default router;

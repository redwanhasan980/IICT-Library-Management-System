import { Role } from '@prisma/client';
import { Router } from 'express';
import loanController from '../controllers/loan.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  accessionLookupSchema,
  bookHistoryParamSchema,
  borrowerHistoryParamSchema,
  issueLoanSchema,
  listLoansSchema,
  loanIdParamSchema,
  returnLoanSchema,
} from '../validators/loan.validator';

const router = Router();

router.use(protect);

router.get('/my', restrictTo(Role.STUDENT, Role.TEACHER), loanController.listMyLoans);
router.get('/history/me', restrictTo(Role.STUDENT, Role.TEACHER), loanController.myHistory);
router.get('/lookup/:accessionNumber', restrictTo(Role.ADMIN), validate(accessionLookupSchema), loanController.lookupByAccession);
router.get('/', restrictTo(Role.ADMIN), validate(listLoansSchema), loanController.list);
router.get('/borrowers/:userId/history', restrictTo(Role.ADMIN), validate(borrowerHistoryParamSchema), loanController.borrowerHistory);
router.get('/books/:bookId/history', restrictTo(Role.ADMIN), validate(bookHistoryParamSchema), loanController.bookHistory);
router.get('/:id', restrictTo(Role.ADMIN, Role.STUDENT, Role.TEACHER), validate(loanIdParamSchema), loanController.getById);

router.post('/issue', restrictTo(Role.ADMIN), validate(issueLoanSchema), loanController.issue);
router.patch('/:id/return', restrictTo(Role.ADMIN), validate(returnLoanSchema), loanController.returnLoan);

export default router;

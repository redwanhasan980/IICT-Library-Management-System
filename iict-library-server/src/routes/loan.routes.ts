import { Role } from '@prisma/client';
import { Router } from 'express';
import loanController from '../controllers/loan.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { accessionLookupSchema, issueLoanSchema, returnLoanSchema } from '../validators/loan.validator';

const router = Router();

router.use(protect);

router.get('/my', restrictTo(Role.STUDENT, Role.TEACHER), loanController.listMyLoans);
router.get('/lookup/:accessionNumber', restrictTo(Role.ADMIN), validate(accessionLookupSchema), loanController.lookupByAccession);

router.post('/issue', restrictTo(Role.ADMIN), validate(issueLoanSchema), loanController.issue);
router.patch('/:id/return', restrictTo(Role.ADMIN), validate(returnLoanSchema), loanController.returnLoan);

export default router;

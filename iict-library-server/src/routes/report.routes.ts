import { Role } from '@prisma/client';
import { Router } from 'express';
import reportController from '../controllers/report.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  auditLogReportSchema,
  catalogInventoryReportSchema,
  issuedBooksReportSchema,
  loanLifecycleReportSchema,
  outsideBooksReportSchema,
  procurementSummaryReportSchema,
} from '../validators/report.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.get('/issued-books', validate(issuedBooksReportSchema), reportController.issuedBooks);
router.get('/returned-books', validate(loanLifecycleReportSchema), reportController.returnedBooks);
router.get('/overdue-loans', validate(loanLifecycleReportSchema), reportController.overdueLoans);
router.get('/outside-books', validate(outsideBooksReportSchema), reportController.outsideBooks);
router.get('/catalog-inventory', validate(catalogInventoryReportSchema), reportController.catalogInventory);
router.get('/procurement-summary', validate(procurementSummaryReportSchema), reportController.procurementSummary);
router.get('/audit-logs', validate(auditLogReportSchema), reportController.auditLogs);

export default router;

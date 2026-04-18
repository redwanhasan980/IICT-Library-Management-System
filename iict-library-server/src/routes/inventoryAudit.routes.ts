import { Role } from '@prisma/client';
import { Router } from 'express';
import inventoryAuditController from '../controllers/inventoryAudit.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  addScanSchema,
  auditSessionIdParamSchema,
  bulkAddScansSchema,
  createAuditSessionSchema,
  listAuditResultsSchema,
} from '../validators/inventoryAudit.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.post('/sessions', validate(createAuditSessionSchema), inventoryAuditController.createSession);
router.get('/sessions', inventoryAuditController.listSessions);
router.get('/sessions/:id', validate(auditSessionIdParamSchema), inventoryAuditController.getSessionDetails);
router.post('/sessions/:id/scans', validate(addScanSchema), inventoryAuditController.addScan);
router.post('/sessions/:id/scans/bulk', validate(bulkAddScansSchema), inventoryAuditController.bulkAddScans);
router.patch('/sessions/:id/close', validate(auditSessionIdParamSchema), inventoryAuditController.closeSession);
router.get('/sessions/:id/results', validate(listAuditResultsSchema), inventoryAuditController.listResults);

export default router;

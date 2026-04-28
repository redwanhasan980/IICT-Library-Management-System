import { Role } from '@prisma/client';
import { Router } from 'express';
import auditLogController from '../controllers/auditLog.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { listAuditLogsSchema } from '../validators/auditLog.validator';

const router = Router();

router.use(protect, restrictTo(Role.ADMIN));

router.get('/', validate(listAuditLogsSchema), auditLogController.list);

export default router;

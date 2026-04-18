import { Role } from '@prisma/client';
import { Router } from 'express';
import policyController from '../controllers/policy.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updatePolicySchema } from '../validators/policy.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN));

router.get('/', policyController.get);
router.patch('/', validate(updatePolicySchema), policyController.update);

export default router;

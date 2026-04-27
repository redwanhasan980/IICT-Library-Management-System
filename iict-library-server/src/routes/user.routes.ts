import { Role } from '@prisma/client';
import { Router } from 'express';
import userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  activeStatusSchema,
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../validators/user.validator';

const router = Router();

router.use(protect, restrictTo(Role.ADMIN));

router.get('/', validate(listUsersSchema), userController.list);
router.post('/', validate(createUserSchema), userController.create);
router.get('/:id', validate(userIdParamSchema), userController.getById);
router.put('/:id', validate(updateUserSchema), userController.update);
router.patch('/:id/status', validate(activeStatusSchema), userController.setActiveStatus);

export default router;

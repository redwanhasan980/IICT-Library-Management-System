import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { bootstrapAdminSchema, loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/bootstrap-admin', validate(bootstrapAdminSchema), authController.bootstrapAdmin);
router.get('/me', protect, authController.me);
router.post('/logout', authController.logout);

export default router;

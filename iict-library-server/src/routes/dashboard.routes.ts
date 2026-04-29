import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/home', dashboardController.home);
router.get('/summary', protect, dashboardController.summary);

export default router;

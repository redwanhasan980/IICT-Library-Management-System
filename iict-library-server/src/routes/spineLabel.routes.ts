import express from 'express';
import { generateSpineLabel } from '../controllers/spineLabel.controller';
import { validate } from '../middleware/validate';
import { generateSpineLabelSchema } from '../validators/spineLabel.validator';
// import { protect, restrictTo } from '../middleware/auth.middleware'; // Assuming auth middleware exists

const router = express.Router();

// Assuming role-based access control middleware exists and is configured
// router.use(protect, restrictTo('admin'));

router.post(
  '/generate',
  validate(generateSpineLabelSchema),
  generateSpineLabel
);

export default router;

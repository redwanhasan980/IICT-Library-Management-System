import { Role } from '@prisma/client';
import { Router } from 'express';
import reservationController from '../controllers/reservation.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createReservationSchema,
  reservationBookParamSchema,
  reservationIdParamSchema,
  updateReservationStatusSchema,
} from '../validators/reservation.validator';

const router = Router();

router.use(protect);

router.post('/', restrictTo(Role.STUDENT, Role.TEACHER), validate(createReservationSchema), reservationController.create);
router.patch('/:id/cancel', restrictTo(Role.STUDENT, Role.TEACHER), validate(reservationIdParamSchema), reservationController.cancelMyReservation);
router.get('/my', restrictTo(Role.STUDENT, Role.TEACHER), reservationController.listMyReservations);

router.get('/pending', restrictTo(Role.ADMIN), reservationController.listPending);
router.get('/book/:bookId', restrictTo(Role.ADMIN), validate(reservationBookParamSchema), reservationController.listForBook);
router.patch('/:id/status', restrictTo(Role.ADMIN), validate(updateReservationStatusSchema), reservationController.updateStatus);

export default router;

import { ReservationStatus } from '@prisma/client';
import { z } from 'zod';

export const createReservationSchema = z.object({
  body: z.object({
    bookId: z.string().min(1, 'Book ID is required'),
  }),
});

export const reservationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Reservation ID is required'),
  }),
});

export const reservationBookParamSchema = z.object({
  params: z.object({
    bookId: z.string().min(1, 'Book ID is required'),
  }),
});

export const updateReservationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Reservation ID is required'),
  }),
  body: z.object({
    status: z.nativeEnum(ReservationStatus),
  }),
});

import type { User } from './user.types';

export interface StudentRef {
  id: string;
  user?: User;
}

export interface OutsideBookEntry {
  id: string;
  student?: StudentRef;
  title: string;
  author: string;
  entryTime: string;
  exitTime?: string;
  isVerifiedEntry: boolean;
  isVerifiedExit: boolean;
  verifiedByEntry?: User;
  verifiedByExit?: User;
}

export type ReservationStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  accessionNumber: string;
  department?: string;
  totalCopies: number;
  availableCopies: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  queueNumber: number;
  queuePosition?: number | null;
  status: ReservationStatus;
  expiresAt?: string;
  fulfilledAt?: string;
  cancelledAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
  book?: Book;
  user?: User;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: LoanStatus;
  book?: Book;
  user?: User;
}

export interface SystemSetting {
  id: number;
  studentBorrowDurationDays: number;
  teacherBorrowDurationDays: number;
  maxActiveLoansStudent: number;
  maxActiveLoansTeacher: number;
  finePerDay: number | string;
  reservationExpiryHours: number;
  outsideBookEnabled: boolean;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsDashboard {
  dateRange: { from: string; to: string };
  mostBorrowedBooks: Array<{ title: string; accessionNumber: string; count: number }>;
  mostActiveBorrowers: Array<{ name: string; email: string; role: string; count: number }>;
  borrowingTrendsByMonth: Array<{ month: string; count: number }>;
  overdueTrendSummary: Array<{ month: string; count: number }>;
  outsideBookUsageSummary: {
    totalEntries: number;
    uniqueStudents: number;
    verifiedEntries: number;
    verifiedExits: number;
  };
  departmentWiseBorrowingSummary: Array<{ department: string; count: number }>;
}

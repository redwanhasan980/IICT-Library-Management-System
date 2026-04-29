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
  studentRegNumberSnapshot?: string;
  studentDepartmentSnapshot?: string;
  studentSemesterSnapshot?: number;
  entryStatus?: 'ENTERED' | 'EXITED';
  entryTime: string;
  exitTime?: string;
  studentStrikeMarkedAt?: string;
  exitVerifiedAt?: string;
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
  authorEditor?: string;
  edition?: string;
  volume?: string;
  placeOfPublication?: string;
  publisher?: string;
  dateOfPublication?: string;
  source?: 'PURCHASE' | 'DONATION' | 'GIFT';
  binding?: 'PB' | 'HB';
  pagination?: number;
  billNumber?: string;
  billDate?: string;
  isbn?: string;
  accessionNumber: string;
  department?: string;
  subjectCategory?: string;
  deweyDecimalNumber?: number;
  cutterCode?: string;
  callNumber?: string;
  locationCode?: string;
  catalogEntryDate?: string;
  catalogedById?: string;
  barcode?: string;
  coverImageUrl?: string;
  procurementId?: string;
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
  borrowerRole?: 'STUDENT' | 'TEACHER';
  facultySignatureText?: string;
  facultySignatureRecordedAt?: string;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: LoanStatus;
  effectiveStatus?: LoanStatus;
  isOverdue?: boolean;
  book?: Book;
  user?: User & {
    student?: { studentRegNumber?: string; department?: string; currentSemester?: number };
    teacher?: { teacherId?: string; department?: string; designation?: string };
  };
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

export type InventoryAuditSessionStatus = 'OPEN' | 'CLOSED';
export type InventoryAuditResultStatus =
  | 'FOUND'
  | 'MISSING'
  | 'EXTRA_OR_UNMATCHED'
  | 'ISSUED_DURING_AUDIT'
  | 'INACTIVE_OR_ARCHIVED';

export interface InventoryAuditSession {
  id: string;
  title: string;
  notes?: string;
  status: InventoryAuditSessionStatus;
  createdById: string;
  closedById?: string;
  startedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { scans: number };
}

export interface InventoryAuditResultItem {
  type: 'BOOK' | 'UNMATCHED_SCAN';
  status: InventoryAuditResultStatus;
  accessionNumber: string;
  title?: string;
  author?: string;
  department?: string;
  bookId?: string;
  isArchived?: boolean;
  scannedCount?: number;
}

export interface InventoryAuditResultSummary {
  totalExpected: number;
  found: number;
  missing: number;
  unmatched: number;
  issuedDuringAudit: number;
  inactiveOrArchived: number;
  scannedTotal: number;
}

export interface InventoryAuditResultsPayload {
  session: InventoryAuditSession;
  summary: InventoryAuditResultSummary;
  items: InventoryAuditResultItem[];
}

export type FinePaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface FinePayment {
  id: string;
  loanId: string;
  userId: string;
  recordedById: string;
  amount: number | string;
  paymentDate: string;
  note?: string;
  createdAt: string;
  loan?: Loan & { book?: Book };
  user?: User;
  recordedBy?: User;
}

export interface FineTransactionSummary {
  loanId: string;
  borrower: User;
  book: Book;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string;
  loanStatus: LoanStatus;
  overdueDays: number;
  finePerDay: number;
  calculatedFine: number;
  paidAmount: number;
  outstanding: number;
  paymentStatus: FinePaymentStatus;
  payments: FinePayment[];
}

export interface FineUserSummary {
  userId: string;
  finePerDay: number;
  totalCalculatedFine: number;
  totalPaid: number;
  totalOutstanding: number;
  transactions: FineTransactionSummary[];
}

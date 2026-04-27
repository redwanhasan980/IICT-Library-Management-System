import type { LoanStatus } from './book.types';
import type { Role, User } from './user.types';

export interface IssuedBookReportRow {
  id: string;
  accessionNumber: string;
  bookTitle: string;
  author: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerRole: Role;
  borrowerIdentifier: string;
  department?: string | null;
  issuedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: LoanStatus;
  effectiveStatus: LoanStatus;
  overdueDays: number;
  issuedBy?: Pick<User, 'id' | 'name' | 'email'>;
  returnedBy?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface IssuedBookReport {
  filters: {
    from?: string;
    to?: string;
    status: LoanStatus | 'ALL';
    borrowerRole?: Role;
    q?: string;
  };
  summary: {
    totalIssued: number;
    activeCount: number;
    returnedCount: number;
    overdueCount: number;
    uniqueBorrowers: number;
  };
  items: IssuedBookReportRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

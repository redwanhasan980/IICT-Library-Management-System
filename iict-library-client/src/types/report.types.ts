import type { LoanStatus } from './book.types';
import type { AuditLog } from './audit.types';
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

export type LoanLifecycleReport = IssuedBookReport;

export interface OutsideBookReportRow {
  id: string;
  title: string;
  author: string;
  studentName: string;
  studentEmail: string;
  studentRegNumber?: string;
  department?: string;
  semester?: number;
  entryStatus: 'ENTERED' | 'EXITED';
  entryTime: string;
  exitTime?: string;
  isVerifiedEntry: boolean;
  isVerifiedExit: boolean;
}

export interface OutsideBookReport {
  summary: {
    totalEntries: number;
    activeEntries: number;
    exitedEntries: number;
    verifiedEntries: number;
    verifiedExits: number;
    uniqueStudents: number;
  };
  items: OutsideBookReportRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CatalogInventoryReportRow {
  id: string;
  accessionNumber: string;
  title: string;
  author: string;
  department?: string;
  callNumber?: string;
  barcode?: string;
  totalCopies: number;
  availableCopies: number;
  isArchived: boolean;
  createdAt: string;
}

export interface CatalogInventoryReport {
  summary: {
    totalRecords: number;
    totalCopies: number;
    availableCopies: number;
    issuedOrUnavailableCopies: number;
    archivedRecords: number;
  };
  items: CatalogInventoryReportRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProcurementSummaryReportRow {
  id: string;
  procurementCode: string;
  requisitionCode: string;
  bookTitle: string;
  authorName: string;
  vendorName: string;
  department?: string;
  procurementStatus: 'NOT_STARTED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  shelvingStatus: 'PENDING' | 'IN_PROGRESS' | 'SHELVED';
  approvalDate?: string;
  deliveryDate?: string;
  handoverDateToIICT?: string;
  catalogedBooks: number;
  estimatedValue: number;
}

export interface ProcurementSummaryReport {
  summary: {
    totalOrders: number;
    notStartedOrders: number;
    ongoingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    catalogedBooks: number;
    estimatedValue: number;
  };
  items: ProcurementSummaryReportRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuditLogReport {
  summary: {
    totalEvents: number;
    uniqueActors: number;
    uniqueActions: number;
  };
  items: AuditLog[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

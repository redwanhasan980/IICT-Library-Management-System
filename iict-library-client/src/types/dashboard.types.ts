import type { Book, Loan, OutsideBookEntry } from './book.types';
import { Role } from './user.types';
import type { User } from './user.types';

export interface HomeDashboardStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  overdueLoans: number;
  activeOutsideBookEntries: number;
}

export interface AdminDashboardStats extends HomeDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  pendingProcurement: number;
}

export interface BorrowerDashboardStats {
  currentBorrowedBooks: number;
  returnedBooks: number;
  overdueBooks: number;
  activeOutsideBookEntries: number;
}

export type BookWithLoanCount = Book & { loanCount?: number };

export interface HomeDashboardData {
  stats: HomeDashboardStats;
  recentBooks: Book[];
  popularBooks: BookWithLoanCount[];
  featuredBooks: Book[];
}

export interface AdminDashboardSummary {
  role: typeof Role.ADMIN;
  stats: AdminDashboardStats;
  recentActivity: {
    recentLoans: Array<Loan & { user?: User }>;
    recentReturns: Array<Loan & { user?: User }>;
    recentOutsideBookEntries: OutsideBookEntry[];
    recentCatalogAdditions: Book[];
  };
}

export interface BorrowerDashboardSummary {
  role: typeof Role.STUDENT | typeof Role.TEACHER;
  stats: BorrowerDashboardStats;
  recentActivity: {
    recentBorrowingActivity: Loan[];
  };
}

export type DashboardSummary = AdminDashboardSummary | BorrowerDashboardSummary;

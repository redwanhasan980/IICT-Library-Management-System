import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardHomePage from './DashboardHomePage';

const loan = {
  id: 'loan-1',
  bookId: 'book-1',
  userId: 'student-1',
  issuedAt: '2026-04-01T00:00:00.000Z',
  dueAt: '2026-04-10T00:00:00.000Z',
  returnedAt: null,
  status: 'ACTIVE',
  isOverdue: true,
  book: {
    id: 'book-1',
    title: 'Database Systems',
    author: 'Elmasri',
    accessionNumber: 'ACC-1',
    availableCopies: 0,
    totalCopies: 1,
    isArchived: false,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
};

vi.mock('../services/dashboard.api', () => ({
  useGetDashboardSummaryQuery: () => ({
    data: {
      role: 'STUDENT',
      stats: {
        currentBorrowedBooks: 1,
        returnedBooks: 2,
        overdueBooks: 1,
        activeOutsideBookEntries: 1,
      },
      recentActivity: { recentBorrowingActivity: [loan] },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetDashboardHomeQuery: () => ({
    data: {
      recentBooks: [loan.book],
      popularBooks: [{ ...loan.book, loanCount: 3 }],
      featuredBooks: [loan.book],
      stats: {},
    },
  }),
}));

vi.mock('../services/library.api', () => ({
  useListRecommendedBooksQuery: () => ({ data: [loan.book] }),
}));

describe('DashboardHomePage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders borrower dashboard stats, activity, recommendations, and book sections', () => {
    render(
      <MemoryRouter>
        <DashboardHomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Current Borrowed')).toBeInTheDocument();
    expect(screen.getByText('Recent Borrowing Activity')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('You May Like')).toBeInTheDocument();
    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    expect(screen.getAllByText('Database Systems').length).toBeGreaterThan(0);
  });
});

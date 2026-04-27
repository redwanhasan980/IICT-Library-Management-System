import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MyBorrowingHistoryPage from './MyBorrowingHistoryPage';

vi.mock('../../services/library.api', () => ({
  useListMyLoanHistoryQuery: () => ({
    data: [{
      id: 'loan-1',
      bookId: 'book-1',
      userId: 'student-user',
      issuedAt: '2026-04-01T00:00:00.000Z',
      dueAt: '2026-04-10T00:00:00.000Z',
      status: 'ACTIVE',
      effectiveStatus: 'OVERDUE',
      isOverdue: true,
      book: { title: 'Algorithms', accessionNumber: 'ACC-1' },
    }],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe('MyBorrowingHistoryPage', () => {
  it('renders current borrowed books, history, and overdue status', () => {
    render(<MyBorrowingHistoryPage />);

    expect(screen.getByText('Current Borrowed Books')).toBeInTheDocument();
    expect(screen.getByText('Borrowing History')).toBeInTheDocument();
    expect(screen.getAllByText('Algorithms').length).toBeGreaterThan(0);
    expect(screen.getAllByText('OVERDUE').length).toBeGreaterThan(0);
  });
});

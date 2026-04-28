import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminCirculationPage from './AdminCirculationPage';

const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
  refetchLoans: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    error: mocks.toastError,
    success: vi.fn(),
  },
}));

vi.mock('../../services/library.api', () => ({
  useLookupByAccessionQuery: () => ({
    data: {
      book: {
        id: 'book-1',
        title: 'Algorithms',
        author: 'Knuth',
        accessionNumber: 'ACC-1',
        availableCopies: 0,
        isArchived: false,
      },
      activeLoan: {
        id: 'loan-1',
        bookId: 'book-1',
        userId: 'student-user',
        issuedAt: '2026-04-01T00:00:00.000Z',
        dueAt: '2026-04-10T00:00:00.000Z',
        status: 'ACTIVE',
        effectiveStatus: 'OVERDUE',
        isOverdue: true,
        book: { title: 'Algorithms', accessionNumber: 'ACC-1' },
        user: { id: 'student-user', name: 'Student One', email: 'student@example.com', role: 'STUDENT' },
      },
      reservationHold: {
        id: 'reservation-1',
        bookId: 'book-1',
        userId: 'queued-user',
        queueNumber: 1,
        status: 'PENDING',
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
        user: { id: 'queued-user', name: 'Queued Borrower', email: 'queued@example.com', role: 'STUDENT' },
      },
    },
    isFetching: false,
  }),
  useListLoansQuery: () => ({
    data: {
      items: [{
        id: 'loan-1',
        bookId: 'book-1',
        userId: 'student-user',
        issuedAt: '2026-04-01T00:00:00.000Z',
        dueAt: '2026-04-10T00:00:00.000Z',
        status: 'ACTIVE',
        effectiveStatus: 'OVERDUE',
        isOverdue: true,
        book: { title: 'Algorithms', accessionNumber: 'ACC-1' },
        user: { id: 'student-user', name: 'Student One', email: 'student@example.com', role: 'STUDENT' },
      }],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    refetch: mocks.refetchLoans,
  }),
  useGetBorrowerHistoryQuery: () => ({ data: [] }),
  useGetBookCirculationHistoryQuery: () => ({ data: [] }),
  useIssueLoanMutation: () => [vi.fn(() => ({ unwrap: vi.fn() })), { isLoading: false }],
  useReturnLoanMutation: () => [vi.fn(() => ({ unwrap: vi.fn() })), { isLoading: false }],
}));

describe('AdminCirculationPage', () => {
  beforeEach(() => {
    mocks.toastError.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders issue and return controls for admins', () => {
    render(<AdminCirculationPage />);

    expect(screen.getByText('Circulation: Issue and Return')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Issue Book' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Return/ }).length).toBeGreaterThan(0);
  });

  it('shows issue form validation errors', () => {
    render(<AdminCirculationPage />);

    fireEvent.change(screen.getByPlaceholderText('Scan or type accession number'), { target: { value: 'ACC-1' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Issue Book' })[0]);

    expect(mocks.toastError).toHaveBeenCalledWith('Provide accession number and borrower identifier');
  });

  it('renders active loans and overdue status', () => {
    render(<AdminCirculationPage />);

    expect(screen.getByText('Active Loans')).toBeInTheDocument();
    expect(screen.getAllByText('ACC-1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('OVERDUE').length).toBeGreaterThan(0);
  });

  it('renders borrower and book history sections', () => {
    render(<AdminCirculationPage />);

    expect(screen.getByText('Borrower History')).toBeInTheDocument();
    expect(screen.getByText('Book Circulation History')).toBeInTheDocument();
  });

  it('renders reservation override controls when an accession has a reservation hold', () => {
    render(<AdminCirculationPage />);

    expect(screen.getByText('Reserved: PENDING')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Override reservation hold'));

    expect(screen.getByPlaceholderText('Required reason for issuing outside reservation order')).toBeInTheDocument();
  });
});

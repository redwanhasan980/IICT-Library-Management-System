import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminReportsPage from './AdminReportsPage';

vi.mock('../../services/report.api', () => ({
  useGetIssuedBooksReportQuery: () => ({
    data: {
      filters: { status: 'ALL' },
      summary: {
        totalIssued: 1,
        activeCount: 0,
        returnedCount: 0,
        overdueCount: 1,
        uniqueBorrowers: 1,
      },
      items: [{
        id: 'loan-1',
        accessionNumber: 'ACC-1',
        bookTitle: 'Database Systems',
        author: 'Elmasri',
        borrowerName: 'Student One',
        borrowerEmail: 'student@example.com',
        borrowerRole: 'STUDENT',
        borrowerIdentifier: 'REG-1',
        department: 'SWE',
        issuedAt: '2026-04-01T00:00:00.000Z',
        dueAt: '2026-04-05T00:00:00.000Z',
        status: 'ACTIVE',
        effectiveStatus: 'OVERDUE',
        overdueDays: 23,
      }],
      page: 1,
      pageSize: 25,
      total: 1,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe('AdminReportsPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders issued-book report filters, summary, table, and export action', () => {
    render(<AdminReportsPage />);

    expect(screen.getByText('Administrative Reports')).toBeInTheDocument();
    expect(screen.getByText('Issued Book Report Filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument();
    expect(screen.getByText('Database Systems')).toBeInTheDocument();
    expect(screen.getByText('ACC-1')).toBeInTheDocument();
    expect(screen.getByText('OVERDUE')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });
});

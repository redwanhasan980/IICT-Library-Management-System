import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminAuditLogsPage from './AdminAuditLogsPage';

vi.mock('../../services/audit.api', () => ({
  useListAuditLogsQuery: () => ({
    data: {
      items: [{
        id: 'audit-1',
        action: 'loan.issue',
        actorId: 'admin-1',
        actorRole: 'ADMIN',
        entityType: 'Loan',
        entityId: 'loan-1',
        metadata: { bookId: 'book-1' },
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        createdAt: '2026-04-28T10:00:00.000Z',
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

describe('AdminAuditLogsPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders audit log filters, table, and CSV action', () => {
    render(<AdminAuditLogsPage />);

    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('loan.issue')).toBeInTheDocument();
    expect(screen.getByText('loan.issue')).toBeInTheDocument();
    expect(screen.getByText('Loan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
  });
});

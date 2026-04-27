import { useState } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Input } from '../../components/shared/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useGetIssuedBooksReportQuery } from '../../services/report.api';
import type { LoanStatus } from '../../types/book.types';
import type { IssuedBookReportRow } from '../../types/report.types';
import type { Role } from '../../types/user.types';

const selectClass =
  'mt-1 rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30';

const statusVariant: Record<LoanStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  ACTIVE: 'info',
  RETURNED: 'success',
  OVERDUE: 'danger',
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  return format(new Date(value), 'PP');
};

const csvEscape = (value: unknown) => {
  const text = String(value ?? '');
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const rowsToCsv = (rows: IssuedBookReportRow[]) => {
  const headers = [
    'accessionNumber',
    'bookTitle',
    'author',
    'borrowerName',
    'borrowerEmail',
    'borrowerRole',
    'borrowerIdentifier',
    'department',
    'issuedAt',
    'dueAt',
    'returnedAt',
    'effectiveStatus',
    'overdueDays',
  ];

  const body = rows.map((row) => [
    row.accessionNumber,
    row.bookTitle,
    row.author,
    row.borrowerName,
    row.borrowerEmail,
    row.borrowerRole,
    row.borrowerIdentifier,
    row.department ?? '',
    row.issuedAt,
    row.dueAt,
    row.returnedAt ?? '',
    row.effectiveStatus,
    row.overdueDays,
  ]);

  return [headers, ...body].map((row) => row.map(csvEscape).join(',')).join('\n');
};

const downloadCsv = (rows: IssuedBookReportRow[]) => {
  const blob = new Blob([rowsToCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'issued-books-report.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const AdminReportsPage = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: 'ALL' as LoanStatus | 'ALL',
    borrowerRole: '' as Role | '',
    q: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, isError, refetch } = useGetIssuedBooksReportQuery({
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
    status: appliedFilters.status,
    borrowerRole: appliedFilters.borrowerRole || undefined,
    q: appliedFilters.q.trim() || undefined,
    page,
    pageSize,
  });

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Administrative Reports</h1>
        <p className="text-sm text-warm-taupe">Generate issued-book reports for management review and operational records.</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Issued Book Report Filters</h2>
        <form onSubmit={applyFilters} className="grid gap-4 lg:grid-cols-6 lg:items-end">
          <div>
            <label className="text-sm text-warm-taupe">From</label>
            <Input type="date" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">To</label>
            <Input type="date" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Status</label>
            <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as LoanStatus | 'ALL' }))} className={selectClass}>
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="OVERDUE">Overdue</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Borrower Role</label>
            <select value={filters.borrowerRole} onChange={(e) => setFilters((prev) => ({ ...prev, borrowerRole: e.target.value as Role | '' }))} className={selectClass}>
              <option value="">All roles</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Search</label>
            <Input value={filters.q} onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))} placeholder="Book or borrower" />
          </div>
          <Button type="submit">Generate</Button>
        </form>
      </Card>

      {isLoading && <LoadingState message="Generating issued-book report..." />}
      {isError && <ErrorState message="Failed to generate issued-book report." onRetry={refetch} />}

      {!isLoading && !isError && data && (
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold text-dark-brown">Issued Book Report</h2>
            <Button variant="secondary" onClick={() => downloadCsv(data.items)} disabled={data.items.length === 0}>
              Download CSV
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <div className="rounded-md border border-sandy-beige p-3">
              <p className="text-xs text-warm-taupe">Total Issued</p>
              <p className="text-xl font-bold text-dark-brown">{data.summary.totalIssued}</p>
            </div>
            <div className="rounded-md border border-sandy-beige p-3">
              <p className="text-xs text-warm-taupe">Active</p>
              <p className="text-xl font-bold text-dark-brown">{data.summary.activeCount}</p>
            </div>
            <div className="rounded-md border border-sandy-beige p-3">
              <p className="text-xs text-warm-taupe">Returned</p>
              <p className="text-xl font-bold text-dark-brown">{data.summary.returnedCount}</p>
            </div>
            <div className="rounded-md border border-sandy-beige p-3">
              <p className="text-xs text-warm-taupe">Overdue</p>
              <p className="text-xl font-bold text-dark-brown">{data.summary.overdueCount}</p>
            </div>
            <div className="rounded-md border border-sandy-beige p-3">
              <p className="text-xs text-warm-taupe">Unique Borrowers</p>
              <p className="text-xl font-bold text-dark-brown">{data.summary.uniqueBorrowers}</p>
            </div>
          </div>

          {data.items.length === 0 ? (
            <EmptyState message="No issued-book records match the selected filters." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Accession</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Overdue Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.accessionNumber}</TableCell>
                      <TableCell>
                        <p>{row.bookTitle}</p>
                        <p className="text-xs text-warm-taupe">{row.author}</p>
                      </TableCell>
                      <TableCell>
                        <p>{row.borrowerName}</p>
                        <p className="text-xs text-warm-taupe">{row.borrowerIdentifier}</p>
                      </TableCell>
                      <TableCell>{row.borrowerRole}</TableCell>
                      <TableCell>{formatDate(row.issuedAt)}</TableCell>
                      <TableCell>{formatDate(row.dueAt)}</TableCell>
                      <TableCell>{formatDate(row.returnedAt)}</TableCell>
                      <TableCell><Badge variant={statusVariant[row.effectiveStatus]}>{row.effectiveStatus}</Badge></TableCell>
                      <TableCell>{row.overdueDays}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-sandy-beige/70 pt-4">
                  <span className="text-sm text-warm-taupe">Page {data.page} of {data.totalPages}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" disabled={data.page === 1} onClick={() => setPage((prev) => prev - 1)}>Prev</Button>
                    <Button size="sm" variant="ghost" disabled={data.page === data.totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminReportsPage;

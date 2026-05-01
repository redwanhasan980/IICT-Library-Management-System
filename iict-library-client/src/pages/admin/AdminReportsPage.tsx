import { useState } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Input } from '../../components/shared/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import {
  useGetAuditLogReportQuery,
  useGetCatalogInventoryReportQuery,
  useGetIssuedBooksReportQuery,
  useGetOutsideBooksReportQuery,
  useGetOverdueLoansReportQuery,
  useGetProcurementSummaryReportQuery,
  useGetReturnedBooksReportQuery,
} from '../../services/report.api';
import type { LoanStatus } from '../../types/book.types';
import type {
  AuditLogReport,
  CatalogInventoryReport,
  CatalogInventoryReportRow,
  IssuedBookReport,
  IssuedBookReportRow,
  OutsideBookReport,
  OutsideBookReportRow,
  ProcurementSummaryReport,
  ProcurementSummaryReportRow,
} from '../../types/report.types';
import type { Role } from '../../types/user.types';

type ReportType = 'issued' | 'returned' | 'overdue' | 'outside' | 'inventory' | 'procurement' | 'audit';
type ReportStatusFilter = LoanStatus | 'ALL' | 'ENTERED' | 'EXITED';

type ReportPayload = {
  summary: Record<string, unknown>;
  items: unknown[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const reportLabels: Record<ReportType, string> = {
  issued: 'Issued Books',
  returned: 'Returned Books',
  overdue: 'Overdue Loans',
  outside: 'Outside Books',
  inventory: 'Catalog Inventory',
  procurement: 'Procurement Summary',
  audit: 'Audit Logs',
};

const selectClass =
  'mt-1 block min-h-10 w-full min-w-0 max-w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30';

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

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-';
  }

  return format(new Date(value), 'PPp');
};

const csvEscape = (value: unknown) => {
  const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const rowsToCsv = (rows: unknown[]) => {
  const normalizedRows = rows.map((row) => row as Record<string, unknown>);
  const headers = Array.from(new Set(normalizedRows.flatMap((row) => Object.keys(row))));
  const body = normalizedRows.map((row) => headers.map((header) => csvEscape(row[header])).join(','));
  return [headers.join(','), ...body].join('\n');
};

const downloadCsv = (reportType: ReportType, rows: unknown[]) => {
  const blob = new Blob([rowsToCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportType}-report-visible-rows.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const summaryLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

const readableMetadata = (metadata: unknown) => {
  if (!metadata) {
    return '-';
  }
  if (typeof metadata === 'string') {
    return metadata;
  }
  const entries = Object.entries(metadata as Record<string, unknown>).slice(0, 3);
  if (entries.length === 0) {
    return 'No metadata';
  }
  return entries
    .map(([key, value]) => {
      const label = summaryLabel(key.replace(/[_-]/g, ' '));
      const text = typeof value === 'object' && value !== null
        ? Object.keys(value as Record<string, unknown>).join(', ') || 'Details'
        : String(value ?? '-');
      return `${label}: ${text}`;
    })
    .join(' | ');
};

const AdminReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>('issued');
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: 'ALL' as ReportStatusFilter,
    borrowerRole: '' as Role | '',
    q: '',
    department: '' as 'CSE' | 'SWE' | 'EEE' | '',
    includeArchived: false,
    procurementStatus: '' as 'NOT_STARTED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | '',
    shelvingStatus: '' as 'PENDING' | 'IN_PROGRESS' | 'SHELVED' | '',
    actorId: '',
    action: '',
    entityType: '',
    entityId: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const loanParams = {
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
    borrowerRole: appliedFilters.borrowerRole || undefined,
    q: appliedFilters.q.trim() || undefined,
    page,
    pageSize,
  };
  const issuedStatus = ['ACTIVE', 'RETURNED', 'OVERDUE', 'ALL'].includes(appliedFilters.status)
    ? appliedFilters.status as LoanStatus | 'ALL'
    : 'ALL';
  const outsideStatus = ['ENTERED', 'EXITED', 'ALL'].includes(appliedFilters.status)
    ? appliedFilters.status as 'ALL' | 'ENTERED' | 'EXITED'
    : 'ALL';

  const issuedQuery = useGetIssuedBooksReportQuery({
    ...loanParams,
    status: issuedStatus,
  }, { skip: reportType !== 'issued' });
  const returnedQuery = useGetReturnedBooksReportQuery(loanParams, { skip: reportType !== 'returned' });
  const overdueQuery = useGetOverdueLoansReportQuery(loanParams, { skip: reportType !== 'overdue' });
  const outsideQuery = useGetOutsideBooksReportQuery({
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
    status: outsideStatus,
    department: appliedFilters.department || undefined,
    q: appliedFilters.q.trim() || undefined,
    page,
    pageSize,
  }, { skip: reportType !== 'outside' });
  const inventoryQuery = useGetCatalogInventoryReportQuery({
    q: appliedFilters.q.trim() || undefined,
    department: appliedFilters.department || undefined,
    includeArchived: appliedFilters.includeArchived,
    page,
    pageSize,
  }, { skip: reportType !== 'inventory' });
  const procurementQuery = useGetProcurementSummaryReportQuery({
    q: appliedFilters.q.trim() || undefined,
    procurementStatus: appliedFilters.procurementStatus || undefined,
    shelvingStatus: appliedFilters.shelvingStatus || undefined,
    page,
    pageSize,
  }, { skip: reportType !== 'procurement' });
  const auditQuery = useGetAuditLogReportQuery({
    q: appliedFilters.q.trim() || undefined,
    actorId: appliedFilters.actorId.trim() || undefined,
    action: appliedFilters.action.trim() || undefined,
    entityType: appliedFilters.entityType.trim() || undefined,
    entityId: appliedFilters.entityId.trim() || undefined,
    from: appliedFilters.from ? new Date(appliedFilters.from).toISOString() : undefined,
    to: appliedFilters.to ? new Date(appliedFilters.to).toISOString() : undefined,
    page,
    pageSize,
  }, { skip: reportType !== 'audit' });

  const activeQuery = {
    issued: issuedQuery,
    returned: returnedQuery,
    overdue: overdueQuery,
    outside: outsideQuery,
    inventory: inventoryQuery,
    procurement: procurementQuery,
    audit: auditQuery,
  }[reportType];

  const data = activeQuery.data as ReportPayload | undefined;

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const renderLoanTable = (rows: IssuedBookReportRow[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Accession</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Borrower</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Returned</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Overdue Days</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
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
            <TableCell>{formatDate(row.issuedAt)}</TableCell>
            <TableCell>{formatDate(row.dueAt)}</TableCell>
            <TableCell>{formatDate(row.returnedAt)}</TableCell>
            <TableCell><Badge variant={statusVariant[row.effectiveStatus]}>{row.effectiveStatus}</Badge></TableCell>
            <TableCell>{row.overdueDays}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderOutsideTable = (rows: OutsideBookReportRow[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Entry</TableHead>
          <TableHead>Exit</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verification</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <p>{row.title}</p>
              <p className="text-xs text-warm-taupe">{row.author}</p>
            </TableCell>
            <TableCell>
              <p>{row.studentName}</p>
              <p className="text-xs text-warm-taupe">{row.studentRegNumber}</p>
            </TableCell>
            <TableCell>{formatDateTime(row.entryTime)}</TableCell>
            <TableCell>{formatDateTime(row.exitTime)}</TableCell>
            <TableCell><Badge variant={row.entryStatus === 'EXITED' ? 'success' : 'warning'}>{row.entryStatus}</Badge></TableCell>
            <TableCell>{row.isVerifiedEntry ? 'Entry verified' : 'Entry pending'} / {row.isVerifiedExit ? 'Exit verified' : 'Exit pending'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderInventoryTable = (rows: CatalogInventoryReportRow[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Accession</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Call No.</TableHead>
          <TableHead>Copies</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.accessionNumber}</TableCell>
            <TableCell>
              <p>{row.title}</p>
              <p className="text-xs text-warm-taupe">{row.author}</p>
            </TableCell>
            <TableCell>{row.department || '-'}</TableCell>
            <TableCell>{row.callNumber || '-'}</TableCell>
            <TableCell>{row.availableCopies} / {row.totalCopies}</TableCell>
            <TableCell><Badge variant={row.isArchived ? 'danger' : 'success'}>{row.isArchived ? 'Archived' : 'Active'}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderProcurementTable = (rows: ProcurementSummaryReportRow[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Procurement</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Shelving</TableHead>
          <TableHead>Cataloged</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.procurementCode}</TableCell>
            <TableCell>
              <p>{row.bookTitle}</p>
              <p className="text-xs text-warm-taupe">{row.requisitionCode}</p>
            </TableCell>
            <TableCell>{row.vendorName}</TableCell>
            <TableCell><Badge variant={row.procurementStatus === 'COMPLETED' ? 'success' : 'info'}>{row.procurementStatus}</Badge></TableCell>
            <TableCell>{row.shelvingStatus}</TableCell>
            <TableCell>{row.catalogedBooks}</TableCell>
            <TableCell>{row.estimatedValue}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderAuditTable = (rows: AuditLogReport['items']) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Metadata</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDateTime(row.createdAt)}</TableCell>
            <TableCell className="font-mono text-xs">{row.action}</TableCell>
            <TableCell className="font-mono text-xs">{row.actorId || '-'}</TableCell>
            <TableCell>{row.entityType || '-'} <span className="font-mono text-xs text-warm-taupe">{row.entityId || ''}</span></TableCell>
            <TableCell className="min-w-[14rem] text-xs text-library-ink">{readableMetadata(row.metadata)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderTable = () => {
    if (!data) {
      return null;
    }

    if (['issued', 'returned', 'overdue'].includes(reportType)) {
      return renderLoanTable((data as IssuedBookReport).items);
    }

    if (reportType === 'outside') {
      return renderOutsideTable((data as OutsideBookReport).items);
    }

    if (reportType === 'inventory') {
      return renderInventoryTable((data as CatalogInventoryReport).items);
    }

    if (reportType === 'procurement') {
      return renderProcurementTable((data as ProcurementSummaryReport).items);
    }

    return renderAuditTable((data as AuditLogReport).items);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Administrative Reports</h1>
        <p className="text-sm text-warm-taupe">Generate database-backed reports for management review and operational records.</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Report Filters</h2>
        <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">Report Type</label>
            <select value={reportType} onChange={(e) => { setReportType(e.target.value as ReportType); setPage(1); }} className={selectClass}>
              {Object.entries(reportLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {reportType !== 'inventory' && reportType !== 'procurement' && (
            <>
              <div className="min-w-0">
                <label className="text-sm text-warm-taupe">From</label>
                <Input type={reportType === 'audit' ? 'datetime-local' : 'date'} value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
              </div>
              <div className="min-w-0">
                <label className="text-sm text-warm-taupe">To</label>
                <Input type={reportType === 'audit' ? 'datetime-local' : 'date'} value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
              </div>
            </>
          )}

          {reportType === 'issued' && (
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Status</label>
              <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as ReportStatusFilter }))} className={selectClass}>
                <option value="ALL">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="OVERDUE">Overdue</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
          )}

          {['issued', 'returned', 'overdue'].includes(reportType) && (
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Borrower Role</label>
              <select value={filters.borrowerRole} onChange={(e) => setFilters((prev) => ({ ...prev, borrowerRole: e.target.value as Role | '' }))} className={selectClass}>
                <option value="">All roles</option>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>
          )}

          {reportType === 'outside' && (
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Entry Status</label>
              <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as ReportStatusFilter }))} className={selectClass}>
                <option value="ALL">All status</option>
                <option value="ENTERED">Entered</option>
                <option value="EXITED">Exited</option>
              </select>
            </div>
          )}

          {(reportType === 'outside' || reportType === 'inventory') && (
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Department</label>
              <select value={filters.department} onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value as 'CSE' | 'SWE' | 'EEE' | '' }))} className={selectClass}>
                <option value="">All departments</option>
                <option value="CSE">CSE</option>
                <option value="SWE">SWE</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
          )}

          {reportType === 'inventory' && (
            <label className="flex items-center gap-2 text-sm text-warm-taupe">
              <input type="checkbox" checked={filters.includeArchived} onChange={(e) => setFilters((prev) => ({ ...prev, includeArchived: e.target.checked }))} />
              Include archived
            </label>
          )}

          {reportType === 'procurement' && (
            <>
              <div className="min-w-0">
                <label className="text-sm text-warm-taupe">Procurement Status</label>
                <select value={filters.procurementStatus} onChange={(e) => setFilters((prev) => ({ ...prev, procurementStatus: e.target.value as 'NOT_STARTED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | '' }))} className={selectClass}>
                  <option value="">All status</option>
                  <option value="NOT_STARTED">Not started</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="min-w-0">
                <label className="text-sm text-warm-taupe">Shelving</label>
                <select value={filters.shelvingStatus} onChange={(e) => setFilters((prev) => ({ ...prev, shelvingStatus: e.target.value as 'PENDING' | 'IN_PROGRESS' | 'SHELVED' | '' }))} className={selectClass}>
                  <option value="">All shelving</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="SHELVED">Shelved</option>
                </select>
              </div>
            </>
          )}

          {reportType === 'audit' && (
            <>
              <div className="min-w-0">
                <label className="text-sm text-warm-taupe">Action</label>
                <Input value={filters.action} onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))} placeholder="loan.issue" />
              </div>
              <div className="min-w-0">
                <label className="text-sm text-warm-taupe">Entity</label>
                <Input value={filters.entityType} onChange={(e) => setFilters((prev) => ({ ...prev, entityType: e.target.value }))} placeholder="Loan" />
              </div>
              <div className="min-w-0">
                <label className="text-sm text-warm-taupe">Actor ID</label>
                <Input value={filters.actorId} onChange={(e) => setFilters((prev) => ({ ...prev, actorId: e.target.value }))} placeholder="User ID" />
              </div>
            </>
          )}

          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">Search</label>
            <Input value={filters.q} onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))} placeholder="Search report" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">Generate</Button>
          </div>
        </form>
      </Card>

      {activeQuery.isLoading && <LoadingState message={`Generating ${reportLabels[reportType]} report...`} />}
      {activeQuery.isError && <ErrorState message={`Failed to generate ${reportLabels[reportType]} report.`} onRetry={activeQuery.refetch} />}

      {!activeQuery.isLoading && !activeQuery.isError && data && (
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold text-dark-brown">{reportLabels[reportType]} Report</h2>
            <Button variant="secondary" onClick={() => downloadCsv(reportType, data.items)} disabled={data.items.length === 0}>
              Download CSV
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {Object.entries(data.summary).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-sandy-beige bg-library-mist/30 p-3">
                <p className="text-xs text-warm-taupe">{summaryLabel(key)}</p>
                <p className="text-xl font-bold text-dark-brown">{String(value ?? 0)}</p>
              </div>
            ))}
          </div>

          {data.items.length === 0 ? (
            <EmptyState message="No report records match the selected filters." />
          ) : (
            <>
              {renderTable()}
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

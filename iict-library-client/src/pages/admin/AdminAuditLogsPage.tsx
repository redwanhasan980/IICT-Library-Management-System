import { useState } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Input } from '../../components/shared/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useListAuditLogsQuery } from '../../services/audit.api';
import type { AuditLog } from '../../types/audit.types';

const formatDate = (value?: string) => (value ? format(new Date(value), 'PPp') : '-');

const metadataText = (metadata: unknown) => {
  if (!metadata) {
    return '-';
  }

  if (typeof metadata === 'string') {
    return metadata;
  }

  return JSON.stringify(metadata);
};

const humanizeKey = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (char) => char.toUpperCase());

const shortValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).join(', ') || 'Details';
  }
  return String(value);
};

const MetadataSummary = ({ metadata }: { metadata: unknown }) => {
  if (!metadata) {
    return <span className="text-warm-taupe">-</span>;
  }

  if (typeof metadata === 'string') {
    return <span className="text-library-ink">{metadata}</span>;
  }

  const entries = Object.entries(metadata as Record<string, unknown>).slice(0, 4);

  if (entries.length === 0) {
    return <span className="text-warm-taupe">No metadata</span>;
  }

  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <span key={key} className="border border-library-ink bg-library-mist px-2.5 py-1 text-xs text-library-ink">
          <span className="font-semibold">{humanizeKey(key)}:</span> {shortValue(value)}
        </span>
      ))}
    </div>
  );
};

const csvEscape = (value: unknown) => {
  const text = String(value ?? '');
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const rowsToCsv = (rows: AuditLog[]) => {
  const headers = ['createdAt', 'actorId', 'actorRole', 'action', 'entityType', 'entityId', 'metadata', 'ipAddress', 'userAgent'];
  const body = rows.map((row) => [
    row.createdAt,
    row.actorId ?? '',
    row.actorRole ?? '',
    row.action,
    row.entityType ?? '',
    row.entityId ?? '',
    metadataText(row.metadata),
    row.ipAddress ?? '',
    row.userAgent ?? '',
  ]);

  return [headers, ...body].map((row) => row.map(csvEscape).join(',')).join('\n');
};

const downloadCsv = (rows: AuditLog[]) => {
  const blob = new Blob([rowsToCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'audit-logs-visible-rows.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const AdminAuditLogsPage = () => {
  const [filters, setFilters] = useState({
    q: '',
    actorId: '',
    action: '',
    entityType: '',
    entityId: '',
    from: '',
    to: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, isError, refetch } = useListAuditLogsQuery({
    q: appliedFilters.q.trim() || undefined,
    actorId: appliedFilters.actorId.trim() || undefined,
    action: appliedFilters.action.trim() || undefined,
    entityType: appliedFilters.entityType.trim() || undefined,
    entityId: appliedFilters.entityId.trim() || undefined,
    from: appliedFilters.from ? new Date(appliedFilters.from).toISOString() : undefined,
    to: appliedFilters.to ? new Date(appliedFilters.to).toISOString() : undefined,
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
        <h1 className="text-2xl font-bold text-dark-brown">Audit Logs</h1>
        <p className="text-sm text-warm-taupe">Review administrative and security-sensitive system activity.</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Filters</h2>
        <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">Search</label>
            <Input value={filters.q} onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))} placeholder="Action, actor, entity" />
          </div>
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">Actor ID</label>
            <Input value={filters.actorId} onChange={(e) => setFilters((prev) => ({ ...prev, actorId: e.target.value }))} placeholder="User ID" />
          </div>
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">Action</label>
            <Input value={filters.action} onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))} placeholder="loan.issue" />
          </div>
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">Entity</label>
            <Input value={filters.entityType} onChange={(e) => setFilters((prev) => ({ ...prev, entityType: e.target.value }))} placeholder="Loan" />
          </div>
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">Entity ID</label>
            <Input value={filters.entityId} onChange={(e) => setFilters((prev) => ({ ...prev, entityId: e.target.value }))} placeholder="Record ID" />
          </div>
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">From</label>
            <Input type="datetime-local" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
          </div>
          <div className="min-w-0">
            <label className="text-sm text-warm-taupe">To</label>
            <Input type="datetime-local" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
          </div>
          <div className="flex items-end sm:col-span-2 xl:col-span-3 2xl:col-span-1">
            <Button type="submit" className="w-full sm:w-auto">Apply Filters</Button>
          </div>
        </form>
      </Card>

      {isLoading && <LoadingState message="Loading audit logs..." />}
      {isError && <ErrorState message="Failed to load audit logs." onRetry={refetch} />}

      {!isLoading && !isError && data && (
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-dark-brown">Audit Log Results</h2>
              <p className="text-sm text-warm-taupe">{data.total} records found</p>
            </div>
            <Button variant="secondary" disabled={data.items.length === 0} onClick={() => downloadCsv(data.items)}>
              Export CSV
            </Button>
          </div>

          {data.items.length === 0 ? (
            <EmptyState message="No audit logs match the selected filters." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Metadata</TableHead>
                    <TableHead>Client</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell className="font-mono text-xs">{row.action}</TableCell>
                      <TableCell>
                        <p className="font-mono text-xs">{row.actorId || '-'}</p>
                        {row.actorRole && <Badge variant="info">{row.actorRole}</Badge>}
                      </TableCell>
                      <TableCell>
                        <p>{row.entityType || '-'}</p>
                        <p className="font-mono text-xs text-warm-taupe">{row.entityId || '-'}</p>
                      </TableCell>
                      <TableCell className="min-w-[16rem] align-top">
                        <MetadataSummary metadata={row.metadata} />
                      </TableCell>
                      <TableCell>
                        <p className="text-xs">{row.ipAddress || '-'}</p>
                        <p className="max-w-xs truncate text-xs text-warm-taupe">{row.userAgent || '-'}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t-2 border-library-ink pt-4">
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

export default AdminAuditLogsPage;

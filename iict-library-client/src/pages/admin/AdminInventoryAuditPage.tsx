import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Badge } from '../../components/shared/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import {
  useAddInventoryAuditScanMutation,
  useBulkAddInventoryAuditScansMutation,
  useCloseInventoryAuditSessionMutation,
  useCreateInventoryAuditSessionMutation,
  useListInventoryAuditResultsQuery,
  useListInventoryAuditSessionsQuery,
} from '../../services/library.api';
import type { InventoryAuditResultStatus } from '../../types/book.types';

const statusBadgeVariant: Record<InventoryAuditResultStatus, 'success' | 'warning' | 'info' | 'danger'> = {
  FOUND: 'success',
  MISSING: 'danger',
  EXTRA_OR_UNMATCHED: 'warning',
  ISSUED_DURING_AUDIT: 'info',
  INACTIVE_OR_ARCHIVED: 'info',
};

const compactSelectClass =
  'border-2 border-library-ink bg-paper-soft px-2 py-1 text-sm font-semibold text-library-ink shadow-[2px_2px_0_#1a1c1a] focus:outline-none focus:ring-2 focus:ring-library-forest/40';

const AdminInventoryAuditPage = () => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [singleAccession, setSingleAccession] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryAuditResultStatus | ''>('');

  const {
    data: sessions,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useListInventoryAuditSessionsQuery();

  const [createSession, { isLoading: creatingSession }] = useCreateInventoryAuditSessionMutation();
  const [addScan, { isLoading: addingScan }] = useAddInventoryAuditScanMutation();
  const [bulkAddScans, { isLoading: bulkAddingScans }] = useBulkAddInventoryAuditScansMutation();
  const [closeSession, { isLoading: closingSession }] = useCloseInventoryAuditSessionMutation();

  const activeSession = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return undefined;
    }

    if (selectedSessionId) {
      return sessions.find((session) => session.id === selectedSessionId);
    }

    return sessions.find((session) => session.status === 'OPEN') || sessions[0];
  }, [sessions, selectedSessionId]);

  const {
    data: results,
    isLoading: resultsLoading,
    isError: resultsError,
    refetch: refetchResults,
  } = useListInventoryAuditResultsQuery(
    {
      sessionId: activeSession?.id || '',
      status: statusFilter || undefined,
    },
    { skip: !activeSession?.id }
  );

  const handleCreateSession = async () => {
    if (!title.trim()) {
      toast.error('Audit session title is required');
      return;
    }

    try {
      const created = await createSession({
        title: title.trim(),
        notes: notes.trim() || undefined,
      }).unwrap();

      setTitle('');
      setNotes('');
      setSelectedSessionId(created.id);
      toast.success('Audit session created');
    } catch {
      toast.error('Failed to create audit session');
    }
  };

  const handleAddScan = async () => {
    if (!activeSession?.id || !singleAccession.trim()) {
      toast.error('Select an audit session and provide accession number');
      return;
    }

    try {
      await addScan({
        sessionId: activeSession.id,
        accessionNumber: singleAccession.trim(),
      }).unwrap();
      setSingleAccession('');
      toast.success('Scan added');
    } catch {
      toast.error('Failed to add scan');
    }
  };

  const handleBulkAdd = async () => {
    if (!activeSession?.id || !bulkText.trim()) {
      toast.error('Select a session and provide accession numbers');
      return;
    }

    const accessionNumbers = bulkText
      .split(/\r?\n|,|\s+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (accessionNumbers.length === 0) {
      toast.error('No valid accession numbers found');
      return;
    }

    try {
      const result = await bulkAddScans({
        sessionId: activeSession.id,
        accessionNumbers,
      }).unwrap();
      setBulkText('');
      toast.success(`${result.added} scans added`);
    } catch {
      toast.error('Bulk scan add failed');
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession?.id) {
      return;
    }

    try {
      await closeSession(activeSession.id).unwrap();
      toast.success('Audit session closed');
    } catch {
      toast.error('Failed to close session');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Inventory Audit and Stock Verification</h1>
        <p className="text-sm text-warm-taupe">Create audit sessions, scan accession numbers, and verify stock transparency.</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Create New Audit Session</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-warm-taupe">Session Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quarterly stock verification" />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Notes (optional)</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="North wing + storage racks" />
          </div>
        </div>
        <Button onClick={handleCreateSession} disabled={creatingSession}>
          {creatingSession ? 'Creating...' : 'Create Audit Session'}
        </Button>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Audit Sessions</h2>
        {sessionsLoading && <LoadingState message="Loading audit sessions..." />}
        {sessionsError && <ErrorState message="Failed to load audit sessions." onRetry={refetchSessions} />}
        {!sessionsLoading && !sessionsError && sessions && sessions.length === 0 && <EmptyState message="No audit sessions yet." />}

        {!sessionsLoading && !sessionsError && sessions && sessions.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                className={`border-2 p-4 text-left shadow-[3px_3px_0_#1a1c1a] transition-transform hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${activeSession?.id === session.id ? 'border-library-ink bg-pale-cream' : 'border-library-ink bg-paper-soft'}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-dark-brown">{session.title}</p>
                  <Badge variant={session.status === 'OPEN' ? 'warning' : 'info'}>{session.status}</Badge>
                </div>
                <p className="text-xs text-warm-taupe">Started: {format(new Date(session.startedAt), 'PPp')}</p>
                <p className="text-xs text-warm-taupe">Scans: {session._count?.scans ?? 0}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {activeSession && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-dark-brown">Active Audit Session Dashboard</h2>
            <div className="flex items-center gap-2">
              <Badge variant={activeSession.status === 'OPEN' ? 'warning' : 'info'}>{activeSession.status}</Badge>
              {activeSession.status === 'OPEN' && (
                <Button variant="secondary" onClick={handleCloseSession} disabled={closingSession}>
                  {closingSession ? 'Closing...' : 'Close Session'}
                </Button>
              )}
            </div>
          </div>

          {activeSession.status === 'OPEN' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
                <p className="text-sm font-medium text-dark-brown">Fast Single Entry</p>
                <Input
                  autoFocus
                  value={singleAccession}
                  onChange={(e) => setSingleAccession(e.target.value)}
                  placeholder="Scan or type accession number"
                />
                <Button onClick={handleAddScan} disabled={addingScan}>{addingScan ? 'Adding...' : 'Add Scan'}</Button>
              </div>

              <div className="space-y-2 border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
                <p className="text-sm font-medium text-dark-brown">Bulk Entry</p>
                <textarea
                  className="min-h-24 w-full border-2 border-library-ink bg-paper-soft p-2 text-sm text-library-ink shadow-[2px_2px_0_#1a1c1a] focus:outline-none focus:ring-2 focus:ring-library-forest/40"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste accession numbers (newline/comma/space separated)"
                />
                <Button variant="secondary" onClick={handleBulkAdd} disabled={bulkAddingScans}>
                  {bulkAddingScans ? 'Adding...' : 'Bulk Add Scans'}
                </Button>
              </div>
            </div>
          )}

          {resultsLoading && <LoadingState message="Loading audit results..." />}
          {resultsError && <ErrorState message="Failed to load audit results." onRetry={refetchResults} />}

          {!resultsLoading && !resultsError && results && (
            <>
              <div className="grid gap-3 md:grid-cols-5">
                <Card><p className="text-xs text-warm-taupe">Total Expected</p><p className="text-xl font-bold text-dark-brown">{results.summary.totalExpected}</p></Card>
                <Card><p className="text-xs text-warm-taupe">Found</p><p className="text-xl font-bold text-dark-brown">{results.summary.found}</p></Card>
                <Card><p className="text-xs text-warm-taupe">Missing</p><p className="text-xl font-bold text-dark-brown">{results.summary.missing}</p></Card>
                <Card><p className="text-xs text-warm-taupe">Unmatched</p><p className="text-xl font-bold text-dark-brown">{results.summary.unmatched}</p></Card>
                <Card><p className="text-xs text-warm-taupe">Issued During Audit</p><p className="text-xl font-bold text-dark-brown">{results.summary.issuedDuringAudit}</p></Card>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-warm-taupe">Filter:</label>
                <select
                  className={compactSelectClass}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InventoryAuditResultStatus | '')}
                >
                  <option value="">All</option>
                  <option value="FOUND">FOUND</option>
                  <option value="MISSING">MISSING</option>
                  <option value="EXTRA_OR_UNMATCHED">EXTRA_OR_UNMATCHED</option>
                  <option value="ISSUED_DURING_AUDIT">ISSUED_DURING_AUDIT</option>
                  <option value="INACTIVE_OR_ARCHIVED">INACTIVE_OR_ARCHIVED</option>
                </select>
              </div>

              {results.items.length === 0 ? (
                <EmptyState message="No results for the selected filter." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Accession</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scanned Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.items.map((item, index) => (
                      <TableRow key={`${item.accessionNumber}-${item.type}-${index}`}>
                        <TableCell>
                          <Badge variant={statusBadgeVariant[item.status]}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>{item.accessionNumber}</TableCell>
                        <TableCell>{item.title || '-'}</TableCell>
                        <TableCell>{item.author || '-'}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.scannedCount ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminInventoryAuditPage;

import { useState } from 'react';
import {
  useGetOutsideBookLogsQuery,
  useVerifyOutsideBookEntryMutation,
  useVerifyOutsideBookExitMutation,
} from '../../services/outsideBook.api';
import { Card } from '../../components/shared/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/shared/Table';
import { Button } from '../../components/shared/Button';
import { Badge } from '../../components/shared/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Input } from '../../components/shared/Input';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const AdminOutsideBookLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentRegNumber, setStudentRegNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [verifiedEntry, setVerifiedEntry] = useState('');
  const [verifiedExit, setVerifiedExit] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [queryFilters, setQueryFilters] = useState({
    q: '',
    studentRegNumber: '',
    department: '',
    status: '',
    verifiedEntry: '',
    verifiedExit: '',
    from: '',
    to: '',
  });

  const { data, isLoading, isError, refetch } = useGetOutsideBookLogsQuery({
    q: queryFilters.q || undefined,
    studentRegNumber: queryFilters.studentRegNumber || undefined,
    department: queryFilters.department || undefined,
    status: (queryFilters.status as 'ENTERED' | 'EXITED' | undefined) || undefined,
    verifiedEntry: queryFilters.verifiedEntry ? queryFilters.verifiedEntry === 'true' : undefined,
    verifiedExit: queryFilters.verifiedExit ? queryFilters.verifiedExit === 'true' : undefined,
    from: queryFilters.from || undefined,
    to: queryFilters.to || undefined,
    page,
    pageSize,
  });

  const [verifyEntry, { isLoading: isVerifyingEntry }] = useVerifyOutsideBookEntryMutation();
  const [verifyExit, { isLoading: isVerifyingExit }] = useVerifyOutsideBookExitMutation();

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryFilters({
      q: searchTerm.trim(),
      studentRegNumber: studentRegNumber.trim(),
      department,
      status,
      verifiedEntry,
      verifiedExit,
      from: fromDate,
      to: toDate,
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStudentRegNumber('');
    setDepartment('');
    setStatus('');
    setVerifiedEntry('');
    setVerifiedExit('');
    setFromDate('');
    setToDate('');
    setQueryFilters({
      q: '',
      studentRegNumber: '',
      department: '',
      status: '',
      verifiedEntry: '',
      verifiedExit: '',
      from: '',
      to: '',
    });
    setPage(1);
  };

  const handleVerifyEntry = async (id: string) => {
    if (isVerifyingEntry) {
      return;
    }
    try {
      await verifyEntry(id).unwrap();
      toast.success('Entry verified!');
    } catch {
      toast.error('Failed to verify entry.');
    }
  };

  const handleVerifyExit = async (id: string) => {
    if (isVerifyingExit) {
      return;
    }
    if (!window.confirm('Mark this entry as exited and verified?')) {
      return;
    }
    try {
      await verifyExit(id).unwrap();
      toast.success('Exit verified!');
    } catch {
      toast.error('Failed to verify exit.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Outside Book Logs</h1>
        <p className="text-sm text-warm-taupe">Search and audit outside-book entries across students.</p>
      </div>

      <Card>
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Search title/author/student</label>
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." />
            </div>
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Student Reg Number</label>
              <Input value={studentRegNumber} onChange={(e) => setStudentRegNumber(e.target.value)} placeholder="Reg number" />
            </div>
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              >
                <option value="">All</option>
                <option value="CSE">CSE</option>
                <option value="SWE">SWE</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              >
                <option value="">All</option>
                <option value="ENTERED">Entered</option>
                <option value="EXITED">Exited</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Entry Verified</label>
              <select
                value={verifiedEntry}
                onChange={(e) => setVerifiedEntry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">Exit Verified</label>
              <select
                value={verifiedExit}
                onChange={(e) => setVerifiedExit(e.target.value)}
                className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">From</label>
              <Input type="datetime-local" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="min-w-0">
              <label className="text-sm text-warm-taupe">To</label>
              <Input type="datetime-local" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">Apply Filters</Button>
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={handleResetFilters}>Reset</Button>
          </div>
        </form>
      </Card>

      <Card>
        {isLoading && <LoadingState message="Loading outside book logs..." />}
        {isError && <ErrorState message="Failed to load logs." onRetry={refetch} />}
        {!isLoading && !isError && data && data.items.length === 0 && (
          <EmptyState message="No outside book entries match these filters." />
        )}
        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Reg No.</TableHead>
                  <TableHead>Dept</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Exit Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.student?.user?.name || entry.student?.id || 'N/A'}</TableCell>
                    <TableCell>{entry.studentRegNumberSnapshot || '-'}</TableCell>
                    <TableCell>{entry.studentDepartmentSnapshot || '-'}</TableCell>
                    <TableCell>{entry.studentSemesterSnapshot ?? '-'}</TableCell>
                    <TableCell>{entry.title}</TableCell>
                    <TableCell>{format(new Date(entry.entryTime), 'PPpp')}</TableCell>
                    <TableCell>{entry.exitTime ? format(new Date(entry.exitTime), 'PPpp') : '-'}</TableCell>
                    <TableCell>
                      {entry.isVerifiedExit ? (
                        <Badge variant="success">Exit Verified</Badge>
                      ) : entry.entryStatus === 'EXITED' ? (
                        <Badge variant="warning">Exit Pending</Badge>
                      ) : entry.isVerifiedEntry ? (
                        <Badge variant="info">Entry Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending Entry</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                      {!entry.isVerifiedEntry && entry.entryStatus === 'ENTERED' && (
                        <Button size="sm" onClick={() => handleVerifyEntry(entry.id)} disabled={isVerifyingEntry}>
                          Verify Entry
                        </Button>
                      )}
                      {!entry.isVerifiedExit && entry.entryStatus === 'EXITED' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleVerifyExit(entry.id)}
                          disabled={isVerifyingExit}
                        >
                          Verify Exit
                        </Button>
                      )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-sandy-beige/70 mt-4 pt-4">
                <span className="text-sm text-warm-taupe">Page {data.page} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={data.page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={data.page === data.totalPages}
                    onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminOutsideBookLogsPage;

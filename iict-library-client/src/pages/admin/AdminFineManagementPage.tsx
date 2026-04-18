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
  useGetFinePaymentHistoryQuery,
  useGetFineSummaryForUserQuery,
  useListUnpaidFinesQuery,
  useRecordFinePaymentMutation,
} from '../../services/library.api';

const statusBadgeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  UNPAID: 'danger',
};

const AdminFineManagementPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'STUDENT' | 'TEACHER' | ''>('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const { data: unpaidRows, isLoading, isError, refetch } = useListUnpaidFinesQuery({
    q: search || undefined,
    role: roleFilter || undefined,
  });

  const { data: selectedUserSummary } = useGetFineSummaryForUserQuery(selectedUserId, {
    skip: !selectedUserId,
  });

  const { data: paymentHistory } = useGetFinePaymentHistoryQuery(
    selectedUserId ? { userId: selectedUserId } : undefined
  );

  const [recordPayment, { isLoading: isRecording }] = useRecordFinePaymentMutation();

  const selectedLoan = useMemo(
    () => unpaidRows?.find((row) => row.loanId === selectedLoanId),
    [unpaidRows, selectedLoanId]
  );

  const onRecordPayment = async () => {
    if (!selectedLoanId) {
      toast.error('Select a transaction first');
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }

    try {
      await recordPayment({
        loanId: selectedLoanId,
        amount: numericAmount,
        note: note.trim() || undefined,
      }).unwrap();

      setAmount('');
      setNote('');
      toast.success('Fine payment recorded');
    } catch {
      toast.error('Failed to record fine payment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Fine Management</h1>
        <p className="text-sm text-warm-taupe">Track overdue fines and record manual payments (partial or full).</p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Search Borrowers / Transactions</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search borrower by ID, name, email"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'STUDENT' | 'TEACHER' | '')}
            className="rounded-md border border-sandy-beige px-3 py-2 text-sm"
          >
            <option value="">All roles</option>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
          <Button variant="secondary" onClick={() => refetch()}>Refresh</Button>
        </div>

        {isLoading && <LoadingState message="Loading unpaid/partial fines..." />}
        {isError && <ErrorState message="Failed to load fines." onRetry={refetch} />}

        {!isLoading && !isError && unpaidRows && unpaidRows.length === 0 && (
          <EmptyState message="No unpaid or partially paid fines found." />
        )}

        {!isLoading && !isError && unpaidRows && unpaidRows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Overdue Days</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unpaidRows.map((row) => (
                <TableRow key={row.loanId}>
                  <TableCell>{row.borrower.name} ({row.borrower.email})</TableCell>
                  <TableCell>{row.borrower.role}</TableCell>
                  <TableCell>{row.book.title}</TableCell>
                  <TableCell>{format(new Date(row.dueAt), 'PP')}</TableCell>
                  <TableCell>{row.overdueDays}</TableCell>
                  <TableCell>{row.outstanding.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeMap[row.paymentStatus] || 'info'}>{row.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedLoanId(row.loanId);
                        setSelectedUserId(row.borrower.id);
                      }}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-dark-brown">Record Manual Payment</h2>
          {!selectedLoan ? (
            <EmptyState message="Select a transaction from the table above." />
          ) : (
            <>
              <p className="text-sm text-warm-taupe">Loan: {selectedLoan.loanId}</p>
              <p className="text-sm text-warm-taupe">Borrower: {selectedLoan.borrower.name}</p>
              <p className="text-sm text-warm-taupe">Remaining: {selectedLoan.outstanding.toFixed(2)}</p>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Payment amount"
                type="number"
                min="0"
                step="0.01"
              />
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Payment note (optional)"
              />
              <Button onClick={onRecordPayment} disabled={isRecording}>
                {isRecording ? 'Recording...' : 'Record Payment'}
              </Button>
            </>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-dark-brown">Outstanding Fine Summary</h2>
          {!selectedUserSummary ? (
            <EmptyState message="Select a borrower to view summary." />
          ) : (
            <div className="space-y-2 text-sm text-dark-brown">
              <p>Total Calculated: {selectedUserSummary.totalCalculatedFine.toFixed(2)}</p>
              <p>Total Paid: {selectedUserSummary.totalPaid.toFixed(2)}</p>
              <p className="font-semibold">Total Outstanding: {selectedUserSummary.totalOutstanding.toFixed(2)}</p>
              <p>Transactions: {selectedUserSummary.transactions.length}</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Payment History</h2>
        {!paymentHistory || paymentHistory.length === 0 ? (
          <EmptyState message="No payment history available for selected borrower." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Loan</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.paymentDate), 'PPp')}</TableCell>
                  <TableCell>{Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>{payment.loanId}</TableCell>
                  <TableCell>{payment.loan?.book?.title || '-'}</TableCell>
                  <TableCell>{payment.recordedBy?.name || payment.recordedBy?.email || '-'}</TableCell>
                  <TableCell>{payment.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AdminFineManagementPage;

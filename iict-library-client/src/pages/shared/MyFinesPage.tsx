import { format } from 'date-fns';
import { Badge } from '../../components/shared/Badge';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useGetFinePaymentHistoryQuery, useGetMyFineSummaryQuery } from '../../services/library.api';

const statusBadgeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  UNPAID: 'danger',
};

const MyFinesPage = () => {
  const { data: summary, isLoading, isError, refetch } = useGetMyFineSummaryQuery();
  const { data: payments } = useGetFinePaymentHistoryQuery(undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">My Fines</h1>

      <Card>
        {isLoading && <LoadingState message="Loading fine summary..." />}
        {isError && <ErrorState message="Failed to load fine summary." onRetry={refetch} />}

        {!isLoading && !isError && summary && (
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-warm-taupe">Total Calculated</p>
              <p className="text-xl font-semibold text-dark-brown">{summary.totalCalculatedFine.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-warm-taupe">Total Paid</p>
              <p className="text-xl font-semibold text-dark-brown">{summary.totalPaid.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-warm-taupe">Total Outstanding</p>
              <p className="text-xl font-semibold text-dark-brown">{summary.totalOutstanding.toFixed(2)}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Fine Transactions</h2>
        {!summary || summary.transactions.length === 0 ? (
          <EmptyState message="No fine-related transactions found." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Overdue Days</TableHead>
                <TableHead>Calculated Fine</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.transactions.map((row) => (
                <TableRow key={row.loanId}>
                  <TableCell>{row.book.title}</TableCell>
                  <TableCell>{format(new Date(row.dueAt), 'PP')}</TableCell>
                  <TableCell>{row.overdueDays}</TableCell>
                  <TableCell>{row.calculatedFine.toFixed(2)}</TableCell>
                  <TableCell>{row.paidAmount.toFixed(2)}</TableCell>
                  <TableCell>{row.outstanding.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={statusBadgeMap[row.paymentStatus] || 'info'}>{row.paymentStatus}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Payment History</h2>
        {!payments || payments.length === 0 ? (
          <EmptyState message="No payment history available." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.paymentDate), 'PPp')}</TableCell>
                  <TableCell>{Number(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>{payment.loan?.book?.title || '-'}</TableCell>
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

export default MyFinesPage;

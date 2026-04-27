import { format } from 'date-fns';
import { Badge } from '../../components/shared/Badge';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useListMyLoanHistoryQuery } from '../../services/library.api';
import type { Loan, LoanStatus } from '../../types/book.types';

const statusVariantMap: Record<LoanStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  ACTIVE: 'info',
  RETURNED: 'success',
  OVERDUE: 'danger',
};

const displayStatus = (loan: Loan) => loan.effectiveStatus ?? loan.status;
const formatDate = (value?: string) => (value ? format(new Date(value), 'PPp') : '-');

const LoanTable = ({ loans }: { loans: Loan[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Accession</TableHead>
        <TableHead>Book</TableHead>
        <TableHead>Issued</TableHead>
        <TableHead>Due</TableHead>
        <TableHead>Returned</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {loans.map((loan) => {
        const status = displayStatus(loan);
        return (
          <TableRow key={loan.id}>
            <TableCell className="font-mono text-xs">{loan.book?.accessionNumber || '-'}</TableCell>
            <TableCell>{loan.book?.title || '-'}</TableCell>
            <TableCell>{formatDate(loan.issuedAt)}</TableCell>
            <TableCell>{formatDate(loan.dueAt)}</TableCell>
            <TableCell>{formatDate(loan.returnedAt)}</TableCell>
            <TableCell>
              <Badge variant={statusVariantMap[status]}>{status}</Badge>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

const MyBorrowingHistoryPage = () => {
  const { data, isLoading, isError, refetch } = useListMyLoanHistoryQuery();
  const currentLoans = data?.filter((loan) => loan.status === 'ACTIVE') ?? [];
  const history = data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">My Borrowing</h1>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Current Borrowed Books</h2>
        {isLoading && <LoadingState message="Loading borrowed books..." />}
        {isError && <ErrorState message="Failed to load borrowing records." onRetry={refetch} />}
        {!isLoading && !isError && currentLoans.length === 0 && (
          <EmptyState message="You do not have any currently borrowed books." />
        )}
        {!isLoading && !isError && currentLoans.length > 0 && <LoanTable loans={currentLoans} />}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Borrowing History</h2>
        {!isLoading && !isError && history.length === 0 && (
          <EmptyState message="No borrowing history found." />
        )}
        {!isLoading && !isError && history.length > 0 && <LoanTable loans={history} />}
      </Card>
    </div>
  );
};

export default MyBorrowingHistoryPage;

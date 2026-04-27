import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useGetMyFineSummaryQuery, useListMyLoanHistoryQuery, useListMyReservationsQuery } from '../../services/library.api';

const TeacherDashboard = () => {
  const { data: loans, isLoading, isError, refetch } = useListMyLoanHistoryQuery();
  const { data: reservations } = useListMyReservationsQuery();
  const { data: fines } = useGetMyFineSummaryQuery();
  const activeLoans = loans?.filter((loan) => loan.status === 'ACTIVE') ?? [];
  const overdueLoans = activeLoans.filter((loan) => loan.isOverdue);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (isError) {
    return <ErrorState message="Failed to load dashboard." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Teacher Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs text-warm-taupe">Current Borrowed</p>
          <p className="text-2xl font-semibold text-dark-brown">{activeLoans.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-warm-taupe">Overdue</p>
          <p className="text-2xl font-semibold text-dark-brown">{overdueLoans.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-warm-taupe">Reservations</p>
          <p className="text-2xl font-semibold text-dark-brown">{reservations?.filter((item) => item.status === 'PENDING').length ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-warm-taupe">Outstanding Fine</p>
          <p className="text-2xl font-semibold text-dark-brown">{fines?.totalOutstanding.toFixed(2) ?? '0.00'}</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Current Loans</h2>
        {activeLoans.length === 0 ? (
          <EmptyState message="No active loans." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accession</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeLoans.slice(0, 8).map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-mono text-xs">{loan.book?.accessionNumber || '-'}</TableCell>
                  <TableCell>{loan.book?.title || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={loan.isOverdue ? 'danger' : 'info'}>{loan.effectiveStatus ?? loan.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default TeacherDashboard;

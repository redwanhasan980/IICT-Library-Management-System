import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import {
  useGetAnalyticsDashboardQuery,
  useListLoansQuery,
  useListPendingReservationsQuery,
  useListUnpaidFinesQuery,
} from '../../services/library.api';

const AdminDashboard = () => {
  const { data: analytics, isLoading, isError, refetch } = useGetAnalyticsDashboardQuery(undefined);
  const { data: activeLoans } = useListLoansQuery({ status: 'ACTIVE', page: 1, pageSize: 1 });
  const { data: overdueLoans } = useListLoansQuery({ status: 'ACTIVE', overdue: true, page: 1, pageSize: 1 });
  const { data: reservations } = useListPendingReservationsQuery();
  const { data: unpaidFines } = useListUnpaidFinesQuery(undefined);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (isError) {
    return <ErrorState message="Failed to load dashboard." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs text-warm-taupe">Active Loans</p>
          <p className="text-2xl font-semibold text-dark-brown">{activeLoans?.total ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-warm-taupe">Overdue Loans</p>
          <p className="text-2xl font-semibold text-dark-brown">{overdueLoans?.total ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-warm-taupe">Pending Reservations</p>
          <p className="text-2xl font-semibold text-dark-brown">{reservations?.length ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-warm-taupe">Fine Transactions</p>
          <p className="text-2xl font-semibold text-dark-brown">{unpaidFines?.length ?? 0}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-dark-brown">Most Borrowed Books</h2>
          {!analytics?.mostBorrowedBooks.length ? (
            <EmptyState message="No borrowing data found." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Loans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.mostBorrowedBooks.slice(0, 5).map((book) => (
                  <TableRow key={book.accessionNumber}>
                    <TableCell className="font-mono text-xs">{book.accessionNumber}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-dark-brown">Most Active Borrowers</h2>
          {!analytics?.mostActiveBorrowers.length ? (
            <EmptyState message="No borrower data found." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Loans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.mostActiveBorrowers.slice(0, 5).map((borrower) => (
                  <TableRow key={`${borrower.email}-${borrower.role}`}>
                    <TableCell>{borrower.name}</TableCell>
                    <TableCell>{borrower.role}</TableCell>
                    <TableCell>{borrower.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

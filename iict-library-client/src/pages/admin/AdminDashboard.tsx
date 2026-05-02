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
      <div className="border-2 border-library-ink bg-library-ink p-5 text-pale-cream shadow-[6px_6px_0_#5e4447] sm:p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-library-gold">Library Operations</p>
        <h1 className="mt-2 text-2xl font-bold text-pale-cream sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-pale-cream/85">
          Monitor circulation, pending requests, fines, and borrower activity from one workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-library-mist">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-taupe">Active Loans</p>
          <p className="mt-2 text-3xl font-bold text-dark-brown">{activeLoans?.total ?? 0}</p>
        </Card>
        <Card className="bg-rose-50/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Overdue Loans</p>
          <p className="mt-2 text-3xl font-bold text-rose-800">{overdueLoans?.total ?? 0}</p>
        </Card>
        <Card className="bg-amber-50/80">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Pending Reservations</p>
          <p className="mt-2 text-3xl font-bold text-amber-800">{reservations?.length ?? 0}</p>
        </Card>
        <Card className="bg-paper-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-taupe">Fine Transactions</p>
          <p className="mt-2 text-3xl font-bold text-dark-brown">{unpaidFines?.length ?? 0}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-taupe">Circulation</p>
            <h2 className="text-lg font-semibold text-dark-brown">Most Borrowed Books</h2>
          </div>
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

        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-taupe">Members</p>
            <h2 className="text-lg font-semibold text-dark-brown">Most Active Borrowers</h2>
          </div>
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

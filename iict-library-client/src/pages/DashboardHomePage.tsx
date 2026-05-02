import BookSection from '../components/home/BookSection';
import QuickActions from '../components/home/QuickActions';
import StatsGrid from '../components/home/StatsGrid';
import { Badge } from '../components/shared/Badge';
import { Card } from '../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/FeedbackState';
import { useGetDashboardHomeQuery, useGetDashboardSummaryQuery } from '../services/dashboard.api';
import { useListRecommendedBooksQuery } from '../services/library.api';
import { Role } from '../types/user.types';

const quickActionsForRole = (role?: string) => {
  if (role === Role.ADMIN) {
    return [
      { to: '/dashboard/admin/catalog/new', label: 'Add Book', description: 'Create a catalog record.' },
      { to: '/dashboard/admin/circulation', label: 'Issue or Return', description: 'Open the circulation desk.' },
      { to: '/dashboard/admin/reports', label: 'Reports', description: 'Review library reports.' },
      { to: '/dashboard/admin/outside-book-logs', label: 'Outside Book Logs', description: 'Monitor outside-book entries.' },
      { to: '/dashboard/admin/procurement', label: 'Procurement', description: 'Manage procurement records.' },
    ];
  }

  if (role === Role.STUDENT) {
    return [
      { to: '/dashboard/books', label: 'Search Books', description: 'Browse available books.' },
      { to: '/dashboard/student/borrowing', label: 'My Borrowing', description: 'View current and returned books.' },
      { to: '/dashboard/add-outside-book', label: 'Register Outside Book', description: 'Add personal book entry.' },
      { to: '/dashboard/profile', label: 'Profile', description: 'Review account details.' },
    ];
  }

  return [
    { to: '/dashboard/books', label: 'Search Books', description: 'Browse available books.' },
    { to: '/dashboard/teacher/borrowing', label: 'My Borrowing', description: 'View current and returned books.' },
    { to: '/dashboard/profile', label: 'Profile', description: 'Review account details.' },
  ];
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '-');

const DashboardHomePage = () => {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetDashboardSummaryQuery();
  const { data: homeData } = useGetDashboardHomeQuery();
  const { data: recommendedBooks } = useListRecommendedBooksQuery({ limit: 6 }, { skip: !summary || summary.role === Role.ADMIN });

  if (isSummaryLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (isSummaryError || !summary) {
    return <ErrorState message="Failed to load dashboard summary." onRetry={refetchSummary} />;
  }

  const adminStats =
    summary.role === Role.ADMIN
      ? [
          { label: 'Total Books', value: summary.stats.totalBooks, tone: 'forest' as const },
          { label: 'Available Books', value: summary.stats.availableBooks, tone: 'gold' as const },
          { label: 'Issued Books', value: summary.stats.issuedBooks, tone: 'ink' as const },
          { label: 'Overdue Loans', value: summary.stats.overdueLoans, tone: 'mist' as const },
          { label: 'Students', value: summary.stats.totalStudents, tone: 'mist' as const },
          { label: 'Teachers', value: summary.stats.totalTeachers, tone: 'mist' as const },
          { label: 'Pending Procurement', value: summary.stats.pendingProcurement, tone: 'mist' as const },
        ]
      : [
          { label: 'Current Borrowed', value: summary.stats.currentBorrowedBooks, tone: 'forest' as const },
          { label: 'Returned Books', value: summary.stats.returnedBooks, tone: 'gold' as const },
          { label: 'Overdue Books', value: summary.stats.overdueBooks, tone: 'ink' as const },
          { label: 'Outside Entries', value: summary.stats.activeOutsideBookEntries, tone: 'mist' as const },
        ];

  const recentBorrowing =
    summary.role !== Role.ADMIN ? summary.recentActivity.recentBorrowingActivity : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-library-gold">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-library-ink">Library Home</h1>
        <p className="mt-2 text-sm text-warm-taupe">
          Role-aware library summary with real catalog, circulation, and activity data.
        </p>
      </div>

      <StatsGrid stats={adminStats} />

      <QuickActions actions={quickActionsForRole(summary.role)} />

      {summary.role === Role.ADMIN ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <h2 className="text-xl font-semibold text-library-ink">Recent Loans</h2>
            {summary.recentActivity.recentLoans.length === 0 ? (
              <EmptyState message="No recent loans found." />
            ) : (
              <div className="mt-4 space-y-3">
                {summary.recentActivity.recentLoans.map((loan) => (
                  <div key={loan.id} className="border-2 border-library-ink bg-pale-cream p-4 shadow-[3px_3px_0_#1a1c1a]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-library-ink">{loan.book?.title || 'Book'}</p>
                        <p className="text-sm text-warm-taupe">{loan.user?.name || loan.user?.email || 'Borrower'}</p>
                      </div>
                      <Badge variant={loan.isOverdue ? 'warning' : 'info'}>{loan.isOverdue ? 'Overdue' : 'Active'}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-warm-taupe">Due {formatDate(loan.dueAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-library-ink">Recent Returns</h2>
            {summary.recentActivity.recentReturns.length === 0 ? (
              <EmptyState message="No recent returns found." />
            ) : (
              <div className="mt-4 space-y-3">
                {summary.recentActivity.recentReturns.map((loan) => (
                  <div key={loan.id} className="border-2 border-library-ink bg-pale-cream p-4 shadow-[3px_3px_0_#1a1c1a]">
                    <p className="font-semibold text-library-ink">{loan.book?.title || 'Book'}</p>
                    <p className="text-sm text-warm-taupe">{loan.user?.name || loan.user?.email || 'Borrower'}</p>
                    <p className="mt-2 text-xs text-warm-taupe">Returned {formatDate(loan.returnedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      ) : (
        <Card>
          <h2 className="text-xl font-semibold text-library-ink">Recent Borrowing Activity</h2>
          {recentBorrowing.length === 0 ? (
            <EmptyState message="No borrowing activity found." />
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {recentBorrowing.map((loan) => (
                <div key={loan.id} className="border-2 border-library-ink bg-pale-cream p-4 shadow-[3px_3px_0_#1a1c1a]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-library-ink">{loan.book?.title || 'Book'}</p>
                      <p className="text-sm text-warm-taupe">Accession {loan.book?.accessionNumber || '-'}</p>
                    </div>
                    <Badge variant={loan.returnedAt ? 'success' : loan.isOverdue ? 'warning' : 'info'}>
                      {loan.returnedAt ? 'Returned' : loan.isOverdue ? 'Overdue' : 'Borrowed'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-warm-taupe">Due {formatDate(loan.dueAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {summary.role !== Role.ADMIN ? (
        <BookSection
          title="You May Like"
          description="Suggestions use your borrowing history and simple catalog fields. No AI recommendation engine is used."
          books={recommendedBooks ?? []}
          emptyMessage="No recommendation records are available yet."
          actionTarget={(book) => `/dashboard/books/${book.id}`}
        />
      ) : null}

      {homeData ? (
        <>
          <BookSection
            title="New Arrivals"
            description="Recently added active catalog records."
            books={homeData.recentBooks}
            emptyMessage="No recent catalog records are available yet."
            actionTarget={(book) => `/dashboard/books/${book.id}`}
          />
          {homeData.popularBooks.length > 0 ? (
            <BookSection
              title="Popular Books"
              description="Books ordered by recorded loan count."
              books={homeData.popularBooks}
              emptyMessage="No borrowing history exists yet."
              actionTarget={(book) => `/dashboard/books/${book.id}`}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default DashboardHomePage;

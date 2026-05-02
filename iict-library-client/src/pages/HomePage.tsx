import HeroCarousel from '../components/home/HeroCarousel';
import StatsGrid from '../components/home/StatsGrid';
import BookSection from '../components/home/BookSection';
import QuickActions from '../components/home/QuickActions';
import { Card } from '../components/shared/Card';
import { ErrorState, LoadingState } from '../components/shared/FeedbackState';
import { useAppSelector } from '../store';
import { selectCurrentUser } from '../services/auth.slice';
import { useGetDashboardHomeQuery } from '../services/dashboard.api';
import { useListRecommendedBooksQuery } from '../services/library.api';
import { Role } from '../types/user.types';

const borrowingPath = (role?: string) => {
  if (role === Role.STUDENT) {
    return '/dashboard/student/borrowing';
  }
  if (role === Role.TEACHER) {
    return '/dashboard/teacher/borrowing';
  }
  return '/login';
};

const quickActionsForRole = (role?: string) => {
  if (role === Role.ADMIN) {
    return [
      { to: '/dashboard/admin/catalog/new', label: 'Add Book', description: 'Create a catalog record with accession and classification details.' },
      { to: '/dashboard/admin/circulation', label: 'Issue Book', description: 'Issue or return books from the circulation desk.' },
      { to: '/dashboard/admin/catalog', label: 'Manage Catalog', description: 'Update, archive, and search catalog records.' },
      { to: '/dashboard/admin/reports', label: 'View Reports', description: 'Open database-backed circulation and inventory reports.' },
    ];
  }

  if (role === Role.STUDENT) {
    return [
      { to: '/dashboard/books', label: 'Search Books', description: 'Find active IICT library books and availability.' },
      { to: '/dashboard/student/borrowing', label: 'My Borrowing', description: 'Review current loans, due dates, and borrowing history.' },
      { to: '/dashboard/add-outside-book', label: 'Register Outside Book', description: 'Record personal books before entering the library.' },
      { to: '/dashboard/profile', label: 'View Profile', description: 'Review your student library account details.' },
    ];
  }

  if (role === Role.TEACHER) {
    return [
      { to: '/dashboard/books', label: 'Search Books', description: 'Find active IICT library books and availability.' },
      { to: '/dashboard/teacher/borrowing', label: 'My Borrowing', description: 'Review current loans, due dates, and borrowing history.' },
      { to: '/dashboard/profile', label: 'View Profile', description: 'Review your teacher library account details.' },
    ];
  }

  return [
    { to: '/catalog', label: 'Search Catalog', description: 'Browse active IICT library books before signing in.' },
    { to: '/login', label: 'Login', description: 'Access borrowing history and protected library workflows.' },
    { to: '/register', label: 'Register', description: 'Create a student or teacher account for library services.' },
  ];
};

const HomePage = () => {
  const user = useAppSelector(selectCurrentUser);
  const { data, isLoading, isError, refetch } = useGetDashboardHomeQuery();
  const { data: recommendedBooks } = useListRecommendedBooksQuery({ limit: 6 }, { skip: !user });
  const detailTarget = user ? (bookId: string) => `/dashboard/books/${bookId}` : () => '/login';

  const heroActions = [
    { to: user ? '/dashboard/books' : '/catalog', label: 'Search Books' },
    { to: user ? borrowingPath(user.role) : '/login', label: user ? 'View My Borrowing' : 'Login', variant: 'secondary' as const },
  ];

  if (user?.role === Role.ADMIN) {
    heroActions.push({ to: '/dashboard/admin', label: 'Admin Dashboard', variant: 'secondary' as const });
  }

  return (
    <div>
      <HeroCarousel
        title="Welcome to IICT Library"
        subtitle="Search, borrow, and manage academic resources digitally through the IICT Library Management System."
        actions={heroActions}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {isLoading && <LoadingState message="Loading library dashboard..." />}
        {isError && <ErrorState message="Failed to load library dashboard data." onRetry={refetch} />}

        {data ? (
          <>
            <StatsGrid
              stats={[
                { label: 'Total Books', value: data.stats.totalBooks, tone: 'forest' },
                { label: 'Available Books', value: data.stats.availableBooks, tone: 'gold' },
                { label: 'Issued Books', value: data.stats.issuedBooks, tone: 'ink' },
                { label: 'Overdue Loans', value: data.stats.overdueLoans, tone: 'mist' },
                { label: 'Outside Entries', value: data.stats.activeOutsideBookEntries, tone: 'mist' },
              ]}
            />

            <BookSection
              title="Featured Books"
              description="Featured books are active, available catalog records shown while persistent favourites are not part of this system."
              books={data.featuredBooks}
              emptyMessage="No featured books are available yet."
              actionTarget={(book) => detailTarget(book.id)}
            />

            <BookSection
              title="You May Like"
              description={
                user
                  ? 'Suggestions use your borrowing history and simple catalog fields. No AI recommendation engine is used.'
                  : 'Recently added books are shown until you sign in.'
              }
              books={user ? recommendedBooks ?? [] : data.recentBooks}
              emptyMessage="No recommendation records are available yet."
              actionTarget={(book) => detailTarget(book.id)}
            />

            <BookSection
              title="New Arrivals"
              description="Recently added active catalog records."
              books={data.recentBooks}
              emptyMessage="No recent catalog records are available yet."
              actionTarget={(book) => detailTarget(book.id)}
            />

            {data.popularBooks.length > 0 ? (
              <BookSection
                title="Popular Books"
                description="Books ordered by recorded loan count."
                books={data.popularBooks}
                emptyMessage="No borrowing history exists yet."
                actionTarget={(book) => detailTarget(book.id)}
              />
            ) : null}
          </>
        ) : null}

        <QuickActions actions={quickActionsForRole(user?.role)} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ['Book Catalog Search', 'Search active catalog records by title, author, accession number, and classification.'],
            ['Borrowing and Return Tracking', 'Maintain current loans, due dates, return history, and overdue status.'],
            ['Outside Book Entry', 'Students can register personal books before entering the library.'],
            ['DDC Classification and Spine Label', 'Support classification fields and spine-label generation for cataloged books.'],
            ['Reports and Monitoring', 'Admins can review database-backed circulation and operational reports.'],
            ['Procurement and Inventory', 'Track procurement workflows and inventory audit sessions where configured.'],
          ].map(([title, description]) => (
            <Card key={title}>
              <h2 className="text-lg font-semibold text-library-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-warm-taupe">{description}</p>
            </Card>
          ))}
        </section>

        <Card className="bg-library-mist">
          <h2 className="text-2xl font-semibold text-library-ink">Help and Library Rules</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <p className="text-sm leading-6 text-warm-taupe">Borrowing limits and due dates are controlled by library policy.</p>
            <p className="text-sm leading-6 text-warm-taupe">Return books on time to keep records clear.</p>
            <p className="text-sm leading-6 text-warm-taupe">Students must register personal books before entering the library.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;

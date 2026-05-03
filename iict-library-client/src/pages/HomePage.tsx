import HeroCarousel from '../components/home/HeroCarousel';
import StatsGrid from '../components/home/StatsGrid';
import BookSection from '../components/home/BookSection';
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

      </div>
    </div>
  );
};

export default HomePage;

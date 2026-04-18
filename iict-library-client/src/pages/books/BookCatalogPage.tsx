import { Link } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Badge } from '../../components/shared/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { useListBooksQuery } from '../../services/library.api';

const BookCatalogPage = () => {
  const { data, isLoading, isError, refetch } = useListBooksQuery({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Book Catalog</h1>
        <p className="text-warm-taupe">Browse available books and reserve unavailable copies.</p>
      </div>

      <Card>
        {isLoading && <LoadingState message="Loading books..." />}
        {isError && <ErrorState message="Failed to load books." onRetry={refetch} />}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <EmptyState message="No books available." />
        )}

        {!isLoading && !isError && data && data.items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((book) => {
              const unavailable = book.availableCopies < 1;
              return (
                <article key={book.id} className="rounded-md border border-sandy-beige p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-dark-brown">{book.title}</h2>
                    {unavailable ? <Badge variant="warning">Unavailable</Badge> : <Badge variant="success">Available</Badge>}
                  </div>
                  <p className="text-sm text-warm-taupe">{book.author}</p>
                  <p className="mt-2 text-xs text-warm-taupe">Accession: {book.accessionNumber}</p>
                  <p className="text-xs text-warm-taupe">Available copies: {book.availableCopies}</p>

                  <div className="mt-4">
                    <Link to={`/dashboard/books/${book.id}`}>
                      <Button variant="secondary" size="sm">View details</Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookCatalogPage;

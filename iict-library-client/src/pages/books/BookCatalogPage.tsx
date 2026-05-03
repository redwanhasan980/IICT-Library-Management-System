import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Badge } from '../../components/shared/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Input } from '../../components/shared/Input';
import { useListBooksQuery } from '../../services/library.api';
import { getBookCoverSrc } from '../../utils/bookImage';

const BookCatalogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [queryTerm, setQueryTerm] = useState('');
  const [page, setPage] = useState(1);

  const pageSize = 24;

  const { data, isLoading, isError, refetch } = useListBooksQuery({
    q: queryTerm || undefined,
    page,
    pageSize,
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQueryTerm(searchTerm.trim());
    setPage(1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setQueryTerm('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Book Catalog</h1>
        <p className="text-warm-taupe">Browse available books and reserve unavailable copies.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="book-search" className="text-sm text-warm-taupe">
              Search Title, Author, Accession, Call Number
            </label>
            <Input
              id="book-search"
              placeholder="Search term..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Search</Button>
            <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </form>
      </Card>

      <Card>
        {isLoading && <LoadingState message="Loading books..." />}
        {isError && <ErrorState message="Failed to load books." onRetry={refetch} />}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <EmptyState message="No books matched your search." />
        )}

        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.items.map((book) => {
                const unavailable = book.availableCopies < 1;

                return (
                  <article
                    key={book.id}
                    className="book-card-paper border-2 border-library-ink bg-pale-cream p-4 shadow-[3px_3px_0_#1a1c1a]"
                  >
                    <div className="book-cover-frame mb-3">
                      <img
                        src={getBookCoverSrc(book)}
                        alt={`Cover for ${book.title}`}
                      />
                    </div>

                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h2 className="text-base font-semibold text-dark-brown">{book.title}</h2>
                      {unavailable ? (
                        <Badge variant="warning">Unavailable</Badge>
                      ) : (
                        <Badge variant="success">Available</Badge>
                      )}
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

            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t-2 border-library-ink px-4 pt-4">
                <span className="text-sm text-warm-taupe">
                  Page {data.page} of {data.totalPages}
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page === 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  >
                    Prev
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page === data.totalPages}
                    onClick={() => setPage((currentPage) => Math.min(data.totalPages, currentPage + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default BookCatalogPage;
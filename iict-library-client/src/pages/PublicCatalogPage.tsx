import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/FeedbackState';
import { Input } from '../components/shared/Input';
import { useAppSelector } from '../store';
import { useListPublicBooksQuery } from '../services/library.api';
import { selectCurrentUser } from '../services/auth.slice';
import { getBookCoverSrc } from '../utils/bookImage';

const PublicCatalogPage = () => {
  const user = useAppSelector(selectCurrentUser);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, refetch } = useListPublicBooksQuery({ q: query || undefined, page: 1, pageSize: 24 });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(search.trim());
  };

  const detailTarget = user ? '/dashboard/books' : '/login';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-library-gold">Catalog Search</p>
          <h1 className="mt-2 text-4xl font-semibold text-library-ink">Search IICT Library Books</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-warm-taupe">
            Browse active catalog records by title, author, accession number, subject, and call number.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full gap-2 lg:max-w-lg">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, author, accession..."
            aria-label="Search catalog"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {isLoading && <LoadingState message="Loading catalog..." />}
      {isError && <ErrorState message="Failed to load public catalog." onRetry={refetch} />}

      {!isLoading && !isError && data ? (
        data.items.length === 0 ? (
          <EmptyState message="No active catalog records matched your search." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((book) => (
              <Card key={book.id} className="flex h-full flex-col gap-4">
                <img
                  src={getBookCoverSrc(book)}
                  alt={`Cover for ${book.title}`}
                  className="h-44 w-full border-2 border-library-ink bg-library-mist object-cover"
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-library-ink">{book.title}</h2>
                    <p className="mt-1 text-sm text-warm-taupe">{book.authorEditor || book.author}</p>
                  </div>
                  <Badge variant={book.availableCopies > 0 ? 'success' : 'warning'}>
                    {book.availableCopies > 0 ? 'Available' : 'Issued'}
                  </Badge>
                </div>
                <dl className="grid gap-2 text-sm text-warm-taupe">
                  <div className="flex justify-between gap-3">
                    <dt>Accession</dt>
                    <dd className="font-semibold text-library-ink">{book.accessionNumber}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Call Number</dt>
                    <dd className="font-semibold text-library-ink">{book.callNumber || '-'}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Department</dt>
                    <dd className="font-semibold text-library-ink">{book.department || '-'}</dd>
                  </div>
                </dl>
                <div className="mt-auto">
                  <Link
                    to={detailTarget}
                    className="inline-flex border-2 border-library-ink bg-paper-soft px-4 py-2 text-sm font-extrabold uppercase tracking-[0.08em] text-library-ink shadow-[4px_4px_0_#1a1c1a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-library-mist active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    {user ? 'Open Catalog' : 'Login for Details'}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
};

export default PublicCatalogPage;

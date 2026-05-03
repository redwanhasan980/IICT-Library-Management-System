import { Link } from 'react-router-dom';
import { Badge } from '../shared/Badge';
import { Card } from '../shared/Card';
import { EmptyState } from '../shared/FeedbackState';
import type { Book } from '../../types/book.types';
import { getBookCoverSrc } from '../../utils/bookImage';

type BookCard = Book & { loanCount?: number };

interface BookSectionProps {
  title: string;
  description?: string;
  books?: BookCard[];
  emptyMessage: string;
  actionTarget: (book: BookCard) => string;
  actionLabel?: string;
}

const BookSection = ({ title, description, books = [], emptyMessage, actionTarget, actionLabel = 'View Details' }: BookSectionProps) => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-library-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-warm-taupe">{description}</p> : null}
      </div>

      {books.length === 0 ? (
        <Card>
          <EmptyState message={emptyMessage} />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="book-card-paper flex h-full flex-col gap-4">
              <div className="book-cover-frame">
                <img
                  src={getBookCoverSrc(book)}
                  alt={`Cover for ${book.title}`}
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-library-ink">{book.title}</h3>
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
                  <dt>Classification</dt>
                  <dd className="font-semibold text-library-ink">{book.deweyDecimalNumber || book.subjectCategory || '-'}</dd>
                </div>
                {typeof book.loanCount === 'number' ? (
                  <div className="flex justify-between gap-3">
                    <dt>Borrowed</dt>
                    <dd className="font-semibold text-library-ink">{book.loanCount} times</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-auto">
                <Link
                  to={actionTarget(book)}
                  className="inline-flex border-2 border-library-ink bg-paper-soft px-4 py-2 text-sm font-extrabold uppercase tracking-[0.08em] text-library-ink shadow-[4px_4px_0_#1a1c1a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-library-mist active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  {actionLabel}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default BookSection;

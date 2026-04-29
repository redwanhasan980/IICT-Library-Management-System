import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { useAppSelector } from '../../store';
import { selectCurrentUser } from '../../services/auth.slice';
import { Role } from '../../types/user.types';
import {
  useCreateReservationMutation,
  useGetBookByIdQuery,
  useListBookReservationsQuery,
} from '../../services/library.api';
import { getBookCoverSrc } from '../../utils/bookImage';

const BookDetailsPage = () => {
  const { id = '' } = useParams();
  const user = useAppSelector(selectCurrentUser);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: book, isLoading, isError, refetch } = useGetBookByIdQuery(id, { skip: !id });
  const { data: reservationQueue } = useListBookReservationsQuery(id, {
    skip: !id || user?.role !== Role.ADMIN,
  });
  const [createReservation, { isLoading: isReserving }] = useCreateReservationMutation();

  const pendingReservationsCount = useMemo(
    () => (book?.reservations ? book.reservations.length : 0),
    [book]
  );

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [book?.id, book?.images?.length]);

  const activeGalleryImage = book?.images?.[selectedImageIndex];

  const handleReserve = async () => {
    if (!id || !book) {
      return;
    }

    try {
      await createReservation({ bookId: id }).unwrap();
      toast.success('Reservation placed successfully');
    } catch {
      toast.error('Failed to place reservation');
    }
  };

  return (
    <div className="space-y-6">
      {isLoading && <LoadingState message="Loading book details..." />}
      {isError && <ErrorState message="Failed to load book details." onRetry={refetch} />}

      {!isLoading && !isError && !book && <EmptyState message="Book not found." />}

      {!isLoading && !isError && book && (
        <>
          <Card className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div className="space-y-3">
                <img
                  src={activeGalleryImage?.detailUrl || getBookCoverSrc(book)}
                  alt={`Cover for ${book.title}`}
                  className="aspect-[9/13] w-full rounded-2xl border border-sandy-beige/70 bg-library-mist object-cover shadow-sm"
                />
                {book.images && book.images.length > 1 ? (
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedImageIndex((index) => Math.max(0, index - 1))}
                      disabled={selectedImageIndex === 0}
                    >
                      Prev
                    </Button>
                    <span className="text-xs font-semibold text-warm-taupe">
                      {selectedImageIndex + 1} / {book.images.length}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedImageIndex((index) => Math.min(book.images!.length - 1, index + 1))}
                      disabled={selectedImageIndex === book.images.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                ) : null}
                {book.images && book.images.length > 1 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {book.images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`rounded-lg border p-1 transition ${
                          selectedImageIndex === index
                            ? 'border-library-gold bg-library-gold/10'
                            : 'border-sandy-beige bg-white hover:bg-library-mist'
                        }`}
                        aria-label={`Show book image ${index + 1}`}
                      >
                        <img
                          src={image.thumbnailUrl}
                          alt={`Thumbnail ${index + 1} for ${book.title}`}
                          className="aspect-[9/13] w-full rounded-md object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold text-dark-brown">{book.title}</h1>
                  {book.availableCopies > 0 ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="warning">Unavailable</Badge>
                  )}
                </div>

                <div className="grid gap-2 text-sm text-warm-taupe md:grid-cols-2">
                  <p><strong>Author:</strong> {book.author}</p>
                  <p><strong>Accession:</strong> {book.accessionNumber}</p>
                  <p><strong>Department:</strong> {book.department || 'N/A'}</p>
                  <p><strong>Call Number:</strong> {book.callNumber || 'N/A'}</p>
                  <p><strong>Available Copies:</strong> {book.availableCopies}</p>
                  <p><strong>Total Copies:</strong> {book.totalCopies}</p>
                  <p><strong>Pending Reservations:</strong> {pendingReservationsCount}</p>
                </div>

                {user && (user.role === Role.STUDENT || user.role === Role.TEACHER) && book.availableCopies < 1 && (
                  <Button onClick={handleReserve} disabled={isReserving}>
                    {isReserving ? 'Reserving...' : 'Reserve this book'}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-dark-brown">Barcode and QR Preview</h2>
            <p className="text-sm text-warm-taupe">Use this for label printing and scanner-friendly accession handling.</p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded border border-sandy-beige p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-warm-taupe">Barcode-like label</p>
                <div className="font-mono text-2xl tracking-[0.35em] text-dark-brown">*{book.accessionNumber}*</div>
                <p className="mt-2 font-mono text-sm">{book.accessionNumber}</p>
              </div>
              <div className="rounded border border-sandy-beige p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-warm-taupe">QR preview</p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(book.accessionNumber)}`}
                  alt={`QR for ${book.accessionNumber}`}
                  className="h-36 w-36 border border-sandy-beige"
                />
              </div>
            </div>
            <Button variant="secondary" onClick={() => window.print()}>Print Label Preview</Button>
          </Card>

          {user?.role === Role.ADMIN && (
            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-dark-brown">Reservation Queue</h2>
              {!reservationQueue || reservationQueue.length === 0 ? (
                <EmptyState message="No reservation records for this book." />
              ) : (
                <ul className="space-y-2 text-sm">
                  {reservationQueue.map((row) => (
                    <li key={row.id} className="rounded border border-sandy-beige px-3 py-2">
                      #{row.queueNumber} - {row.user?.name || row.user?.email || row.userId} ({row.status})
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default BookDetailsPage;

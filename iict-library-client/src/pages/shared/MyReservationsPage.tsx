import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useCancelMyReservationMutation, useListMyReservationsQuery } from '../../services/library.api';

const statusVariantMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  FULFILLED: 'success',
  CANCELLED: 'danger',
  EXPIRED: 'info',
};

const MyReservationsPage = () => {
  const { data, isLoading, isError, refetch } = useListMyReservationsQuery();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelMyReservationMutation();

  const handleCancel = async (id: string) => {
    try {
      await cancelReservation(id).unwrap();
      toast.success('Reservation cancelled');
    } catch {
      toast.error('Failed to cancel reservation');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">My Reservations</h1>
      <Card>
        {isLoading && <LoadingState message="Loading reservations..." />}
        {isError && <ErrorState message="Failed to load reservations." onRetry={refetch} />}

        {!isLoading && !isError && data && data.length === 0 && (
          <EmptyState message="You do not have any reservations yet." />
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Accession</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.book?.title || 'N/A'}</TableCell>
                  <TableCell>{reservation.book?.accessionNumber || 'N/A'}</TableCell>
                  <TableCell>{reservation.queuePosition ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[reservation.status] || 'info'}>{reservation.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {reservation.status === 'PENDING' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isCancelling}
                        onClick={() => handleCancel(reservation.id)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default MyReservationsPage;

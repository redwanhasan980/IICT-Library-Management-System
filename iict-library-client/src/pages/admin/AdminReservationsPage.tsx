import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import {
  useListPendingReservationsQuery,
  useUpdateReservationStatusMutation,
} from '../../services/library.api';

const AdminReservationsPage = () => {
  const { data, isLoading, isError, refetch } = useListPendingReservationsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReservationStatusMutation();

  const handleUpdate = async (id: string, status: 'FULFILLED' | 'CANCELLED' | 'EXPIRED') => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Reservation marked as ${status.toLowerCase()}`);
    } catch {
      toast.error('Failed to update reservation status');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Reservation Management</h1>
      <Card>
        {isLoading && <LoadingState message="Loading pending reservations..." />}
        {isError && <ErrorState message="Failed to load pending reservations." onRetry={refetch} />}
        {!isLoading && !isError && data && data.length === 0 && <EmptyState message="No pending reservations." />}

        {!isLoading && !isError && data && data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>#{reservation.queueNumber}</TableCell>
                  <TableCell>{reservation.book?.title}</TableCell>
                  <TableCell>{reservation.user?.name || reservation.user?.email}</TableCell>
                  <TableCell>
                    <Badge variant="warning">{reservation.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(reservation.id, 'FULFILLED')}
                      disabled={isUpdating}
                    >
                      Fulfill
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUpdate(reservation.id, 'CANCELLED')}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdate(reservation.id, 'EXPIRED')}
                      disabled={isUpdating}
                    >
                      Expire
                    </Button>
                    </div>
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

export default AdminReservationsPage;

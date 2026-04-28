import { useGetMyOutsideBookEntriesQuery, useMarkOutsideBookExitMutation } from '../../services/outsideBook.api';
import { Card } from '../../components/shared/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/shared/Table';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { format } from 'date-fns';
import type { OutsideBookEntry } from '../../types/book.types';
import { toast } from 'react-hot-toast';

const MyOutsideBooksPage = () => {
  const { data: entries, isLoading, isError, refetch } = useGetMyOutsideBookEntriesQuery();
  const [markExit, { isLoading: isMarkingExit }] = useMarkOutsideBookExitMutation();

  const activeEntry = entries?.find((entry) => entry.entryStatus === 'ENTERED');

  const getStatusBadge = (entry: OutsideBookEntry) => {
    if (entry.isVerifiedExit) return <Badge variant="success">Exit Verified</Badge>;
    if (entry.entryStatus === 'EXITED') return <Badge variant="warning">Exit Pending</Badge>;
    if (entry.isVerifiedEntry) return <Badge variant="info">Entry Verified</Badge>;
    return <Badge variant="warning">Pending Verification</Badge>;
  };

  const handleMarkExit = async (id: string) => {
    if (isMarkingExit) {
      return;
    }
    if (!window.confirm('Mark this entry as exited?')) {
      return;
    }
    try {
      await markExit(id).unwrap();
      toast.success('Exit recorded. Please wait for admin verification.');
    } catch (error) {
      toast.error('Failed to mark exit.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">My Outside Book Entries</h1>
      <Card>
        <h2 className="text-lg font-semibold text-dark-brown">Current Status</h2>
        {activeEntry ? (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-warm-taupe">Active Entry</p>
              <p className="text-base font-semibold text-dark-brown">{activeEntry.title}</p>
              <p className="text-xs text-warm-taupe">Entered {format(new Date(activeEntry.entryTime), 'PPpp')}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(activeEntry)}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleMarkExit(activeEntry.id)}
                disabled={isMarkingExit}
              >
                Mark Exit
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-warm-taupe">No active outside book entry.</p>
        )}
      </Card>
      <Card>
        {isLoading && <LoadingState message="Loading your entries..." />}
        {isError && <ErrorState message="Failed to load entries." onRetry={refetch} />}
        {entries && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Exit Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell>{entry.author}</TableCell>
                  <TableCell>{format(new Date(entry.entryTime), 'PPpp')}</TableCell>
                  <TableCell>{entry.exitTime ? format(new Date(entry.exitTime), 'PPpp') : '-'}</TableCell>
                  <TableCell>{getStatusBadge(entry)}</TableCell>
                  <TableCell>
                    {entry.entryStatus === 'ENTERED' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkExit(entry.id)}
                        disabled={isMarkingExit}
                      >
                        Mark Exit
                      </Button>
                    ) : (
                      <span className="text-xs text-warm-taupe">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && !isError && entries?.length === 0 && (
          <EmptyState message="You have no outside book entries." />
        )}
      </Card>
    </div>
  );
};

export default MyOutsideBooksPage;

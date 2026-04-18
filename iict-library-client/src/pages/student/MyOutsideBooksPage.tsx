import { useGetMyOutsideBookEntriesQuery } from '../../services/outsideBook.api';
import { Card } from '../../components/shared/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/shared/Table';
import { Badge } from '../../components/shared/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { format } from 'date-fns';
import type { OutsideBookEntry } from '../../types/book.types';

const MyOutsideBooksPage = () => {
  const { data: entries, isLoading, isError, refetch } = useGetMyOutsideBookEntriesQuery();

  const getStatusBadge = (entry: OutsideBookEntry) => {
    if (entry.isVerifiedExit) return <Badge variant="success">Exited</Badge>;
    if (entry.isVerifiedEntry) return <Badge variant="info">Entered</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">My Outside Book Entries</h1>
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

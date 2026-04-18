import { useGetMyOutsideBookEntriesQuery } from '../../services/outsideBook.api';
import { Card } from '../../components/shared/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/shared/Table';
import { Badge } from '../../components/shared/Badge';
import { format } from 'date-fns';

const MyOutsideBooksPage = () => {
  const { data: entries, isLoading, isError } = useGetMyOutsideBookEntriesQuery();

  const getStatusBadge = (entry: any) => {
    if (entry.isVerifiedExit) return <Badge variant="success">Exited</Badge>;
    if (entry.isVerifiedEntry) return <Badge variant="info">Entered</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">My Outside Book Entries</h1>
      <Card>
        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-500">Failed to load entries.</p>}
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
                  <TableCell>{entry.exitTime ? format(new Date(entry.exitTime), 'PPpp') : 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(entry)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && !isError && entries?.length === 0 && (
          <p className="text-center text-warm-taupe py-8">You have no outside book entries.</p>
        )}
      </Card>
    </div>
  );
};

export default MyOutsideBooksPage;

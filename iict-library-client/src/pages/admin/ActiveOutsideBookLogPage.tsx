import {
  useGetActiveOutsideBookEntriesQuery,
  useVerifyOutsideBookEntryMutation,
  useVerifyOutsideBookExitMutation,
} from '../../services/outsideBook.api';
import { Card } from '../../components/shared/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/shared/Table';
import { Button } from '../../components/shared/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ActiveOutsideBookLogPage = () => {
  const { data: entries, isLoading, isError } = useGetActiveOutsideBookEntriesQuery();
  const [verifyEntry, { isLoading: isVerifyingEntry }] = useVerifyOutsideBookEntryMutation();
  const [verifyExit, { isLoading: isVerifyingExit }] = useVerifyOutsideBookExitMutation();

  const handleVerifyEntry = async (id: string) => {
    try {
      await verifyEntry(id).unwrap();
      toast.success('Entry verified!');
    } catch (error) {
      toast.error('Failed to verify entry.');
    }
  };

  const handleVerifyExit = async (id: string) => {
    try {
      await verifyExit(id).unwrap();
      toast.success('Exit verified!');
    } catch (error) {
      toast.error('Failed to verify exit.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Active Outside Book Log</h1>
      <Card>
        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-500">Failed to load active log.</p>}
        {entries && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.student?.user?.name || 'N/A'}</TableCell>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell>{entry.author}</TableCell>
                  <TableCell>{format(new Date(entry.entryTime), 'PPpp')}</TableCell>
                  <TableCell className="space-x-2">
                    {!entry.isVerifiedEntry && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyEntry(entry.id)}
                        disabled={isVerifyingEntry}
                      >
                        Verify Entry
                      </Button>
                    )}
                    {entry.isVerifiedEntry && !entry.isVerifiedExit && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleVerifyExit(entry.id)}
                        disabled={isVerifyingExit}
                      >
                        Verify Exit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && !isError && entries?.length === 0 && (
          <p className="text-center text-warm-taupe py-8">No active outside book entries.</p>
        )}
      </Card>
    </div>
  );
};

export default ActiveOutsideBookLogPage;

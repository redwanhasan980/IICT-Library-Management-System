import {
  useGetActiveOutsideBookEntriesQuery,
  useVerifyOutsideBookEntryMutation,
  useVerifyOutsideBookExitMutation,
} from '../../services/outsideBook.api';
import { Card } from '../../components/shared/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/shared/Table';
import { Button } from '../../components/shared/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Badge } from '../../components/shared/Badge';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ActiveOutsideBookLogPage = () => {
  const { data: entries, isLoading, isError, refetch } = useGetActiveOutsideBookEntriesQuery();
  const [verifyEntry, { isLoading: isVerifyingEntry }] = useVerifyOutsideBookEntryMutation();
  const [verifyExit, { isLoading: isVerifyingExit }] = useVerifyOutsideBookExitMutation();

  const handleVerifyEntry = async (id: string) => {
    if (isVerifyingEntry) {
      return;
    }
    try {
      await verifyEntry(id).unwrap();
      toast.success('Entry verified!');
    } catch {
      toast.error('Failed to verify entry.');
    }
  };

  const handleVerifyExit = async (id: string) => {
    if (isVerifyingExit) {
      return;
    }
    if (!window.confirm('Mark this entry as exited and verified?')) {
      return;
    }
    try {
      await verifyExit(id).unwrap();
      toast.success('Exit verified!');
    } catch {
      toast.error('Failed to verify exit.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Active Outside Book Log</h1>
      <Card>
        {isLoading && <LoadingState message="Loading active outside-book log..." />}
        {isError && <ErrorState message="Failed to load active log." onRetry={refetch} />}
        {entries && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Reg No.</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.student?.user?.name || entry.student?.id || 'N/A'}</TableCell>
                  <TableCell>{entry.studentRegNumberSnapshot || '-'}</TableCell>
                  <TableCell>{entry.studentDepartmentSnapshot || '-'}</TableCell>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell>{entry.author}</TableCell>
                  <TableCell>{format(new Date(entry.entryTime), 'PPpp')}</TableCell>
                  <TableCell>
                    {entry.isVerifiedEntry ? (
                      <Badge variant="info">Entry Verified</Badge>
                    ) : (
                      <Badge variant="warning">Pending Entry</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && !isError && entries?.length === 0 && (
          <EmptyState message="No active outside book entries." />
        )}
      </Card>
    </div>
  );
};

export default ActiveOutsideBookLogPage;

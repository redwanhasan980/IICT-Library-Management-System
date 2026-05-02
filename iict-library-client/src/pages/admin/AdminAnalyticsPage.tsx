import { useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useGetAnalyticsDashboardQuery } from '../../services/library.api';

const AdminAnalyticsPage = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading, isError, refetch } = useGetAnalyticsDashboardQuery(
    from || to ? { from: from || undefined, to: to || undefined } : undefined
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Advanced Analytics and Insights</h1>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Date Range Filter</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink shadow-[2px_2px_0_#1a1c1a] focus:outline-none focus:ring-2 focus:ring-library-forest/40"
          />
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink shadow-[2px_2px_0_#1a1c1a] focus:outline-none focus:ring-2 focus:ring-library-forest/40"
          />
          <Button variant="secondary" onClick={() => refetch()}>
            Apply Filter
          </Button>
        </div>
      </Card>

      {isLoading && <LoadingState message="Loading analytics..." />}
      {isError && <ErrorState message="Failed to load analytics." onRetry={refetch} />}

      {!isLoading && !isError && data && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card><p className="text-xs text-warm-taupe">Outside Entries</p><p className="text-2xl font-bold text-dark-brown">{data.outsideBookUsageSummary.totalEntries}</p></Card>
            <Card><p className="text-xs text-warm-taupe">Unique Outside Users</p><p className="text-2xl font-bold text-dark-brown">{data.outsideBookUsageSummary.uniqueStudents}</p></Card>
            <Card><p className="text-xs text-warm-taupe">Verified Entries</p><p className="text-2xl font-bold text-dark-brown">{data.outsideBookUsageSummary.verifiedEntries}</p></Card>
            <Card><p className="text-xs text-warm-taupe">Verified Exits</p><p className="text-2xl font-bold text-dark-brown">{data.outsideBookUsageSummary.verifiedExits}</p></Card>
          </div>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-dark-brown">Most Borrowed Books</h2>
            {data.mostBorrowedBooks.length === 0 ? (
              <EmptyState message="No borrowing records in selected range." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Accession</TableHead><TableHead>Count</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.mostBorrowedBooks.map((row) => (
                    <TableRow key={`${row.accessionNumber}-${row.title}`}>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.accessionNumber}</TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-dark-brown">Borrowing Trends by Month</h2>
            <div className="space-y-2">
              {data.borrowingTrendsByMonth.map((row) => (
                <div key={row.month} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-warm-taupe">{row.month}</span>
                  <div className="h-3 flex-1 border border-library-ink bg-library-mist">
                    <div className="h-full bg-library-ink" style={{ width: `${Math.min(100, row.count * 5)}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm text-dark-brown">{row.count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold text-dark-brown">Department-wise Borrowing</h2>
            <Table>
              <TableHeader><TableRow><TableHead>Department</TableHead><TableHead>Count</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.departmentWiseBorrowingSummary.map((row) => (
                  <TableRow key={row.department}>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;

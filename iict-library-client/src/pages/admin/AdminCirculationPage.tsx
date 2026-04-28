import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Badge } from '../../components/shared/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import {
  useGetBookCirculationHistoryQuery,
  useGetBorrowerHistoryQuery,
  useIssueLoanMutation,
  useListLoansQuery,
  useLookupByAccessionQuery,
  useReturnLoanMutation,
} from '../../services/library.api';
import type { Loan, LoanStatus } from '../../types/book.types';
import { getApiErrorMessage } from '../../utils/apiError';

const statusVariantMap: Record<LoanStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  ACTIVE: 'info',
  RETURNED: 'success',
  OVERDUE: 'danger',
};

const displayStatus = (loan: Loan) => loan.effectiveStatus ?? loan.status;

const formatDate = (value?: string) => (value ? format(new Date(value), 'PPp') : '-');

const borrowerLabel = (loan?: Loan) => {
  if (!loan?.user) {
    return '-';
  }
  const identifier = loan.user.role === 'STUDENT'
    ? loan.user.student?.studentRegNumber
    : loan.user.teacher?.teacherId;
  return `${loan.user.name || loan.user.email} (${loan.user.role}${identifier ? `: ${identifier}` : ''})`;
};

const AdminCirculationPage = () => {
  const [accessionInput, setAccessionInput] = useState('');
  const [activeAccession, setActiveAccession] = useState('');
  const [borrowerMode, setBorrowerMode] = useState<'userId' | 'studentRegNumber' | 'teacherId'>('userId');
  const [borrowerIdentifier, setBorrowerIdentifier] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [facultySignature, setFacultySignature] = useState('');
  const [loanSearchInput, setLoanSearchInput] = useState('');
  const [loanSearch, setLoanSearch] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedBorrowerId, setSelectedBorrowerId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  const { data: lookupData, isFetching } = useLookupByAccessionQuery(activeAccession, {
    skip: !activeAccession,
  });

  const {
    data: loans,
    isLoading: isLoadingLoans,
    isError: isLoansError,
    refetch: refetchLoans,
  } = useListLoansQuery({
    status: overdueOnly ? 'ACTIVE' : undefined,
    overdue: overdueOnly ? true : undefined,
    q: loanSearch || undefined,
    page,
    pageSize,
  });

  const { data: borrowerHistory } = useGetBorrowerHistoryQuery(selectedBorrowerId, {
    skip: !selectedBorrowerId,
  });
  const { data: bookHistory } = useGetBookCirculationHistoryQuery(selectedBookId, {
    skip: !selectedBookId,
  });

  const [issueLoan, { isLoading: isIssuing }] = useIssueLoanMutation();
  const [returnLoan, { isLoading: isReturning }] = useReturnLoanMutation();

  useEffect(() => {
    const trim = accessionInput.trim();
    if (!trim) {
      setActiveAccession('');
      return;
    }

    const timer = setTimeout(() => {
      setActiveAccession(trim);
    }, 200);

    return () => clearTimeout(timer);
  }, [accessionInput]);

  useEffect(() => {
    if (lookupData?.activeLoan?.userId) {
      setSelectedBorrowerId(lookupData.activeLoan.userId);
    }
    if (lookupData?.book?.id) {
      setSelectedBookId(lookupData.book.id);
    }
  }, [lookupData]);

  const issuePayload = () => {
    const identifier = borrowerIdentifier.trim();
    return {
      accessionNumber: accessionInput.trim(),
      userId: borrowerMode === 'userId' ? identifier : undefined,
      studentRegNumber: borrowerMode === 'studentRegNumber' ? identifier : undefined,
      teacherId: borrowerMode === 'teacherId' ? identifier : undefined,
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      facultySignatureText: facultySignature.trim() || undefined,
    };
  };

  const handleIssue = async () => {
    if (!accessionInput.trim() || !borrowerIdentifier.trim()) {
      toast.error('Provide accession number and borrower identifier');
      return;
    }

    try {
      await issueLoan(issuePayload()).unwrap();
      toast.success('Loan issued successfully');
      setBorrowerIdentifier('');
      setFacultySignature('');
      setDueAt('');
      refetchLoans();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to issue loan'));
    }
  };

  const handleReturn = async (loanId?: string) => {
    const id = loanId || lookupData?.activeLoan?.id;
    if (!id) {
      toast.error('No active loan selected for return');
      return;
    }

    try {
      await returnLoan(id).unwrap();
      toast.success('Loan returned successfully');
      refetchLoans();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to return loan'));
    }
  };

  const applyLoanSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setLoanSearch(loanSearchInput.trim());
    setPage(1);
  };

  const renderLoanRows = (items: Loan[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Accession</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Borrower</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Returned</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((loan) => {
          const status = displayStatus(loan);
          return (
            <TableRow key={loan.id}>
              <TableCell className="font-mono text-xs">{loan.book?.accessionNumber || '-'}</TableCell>
              <TableCell>{loan.book?.title || '-'}</TableCell>
              <TableCell>{borrowerLabel(loan)}</TableCell>
              <TableCell>{formatDate(loan.issuedAt)}</TableCell>
              <TableCell>{formatDate(loan.dueAt)}</TableCell>
              <TableCell>{formatDate(loan.returnedAt)}</TableCell>
              <TableCell>
                <Badge variant={statusVariantMap[status]}>{status}</Badge>
              </TableCell>
              <TableCell className="space-x-2">
                {loan.status === 'ACTIVE' && (
                  <Button size="sm" variant="secondary" disabled={isReturning} onClick={() => handleReturn(loan.id)}>
                    Return
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setSelectedBorrowerId(loan.userId)}>
                  Borrower
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedBookId(loan.bookId)}>
                  Book
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Circulation: Issue and Return</h1>

      <Card className="space-y-4">
        <p className="text-sm text-warm-taupe">
          Scanner-friendly input: click the accession field and scan using keyboard-wedge barcode/QR scanner.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-warm-taupe">Accession Number</label>
            <Input
              autoFocus
              value={accessionInput}
              onChange={(e) => setAccessionInput(e.target.value)}
              placeholder="Scan or type accession number"
            />
          </div>

          <div>
            <label className="text-sm text-warm-taupe">Borrower Identifier</label>
            <div className="grid gap-2 sm:grid-cols-[170px_1fr]">
              <select
                value={borrowerMode}
                onChange={(e) => setBorrowerMode(e.target.value as 'userId' | 'studentRegNumber' | 'teacherId')}
                className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              >
                <option value="userId">User ID</option>
                <option value="studentRegNumber">Student Reg No.</option>
                <option value="teacherId">Teacher ID</option>
              </select>
              <Input
                value={borrowerIdentifier}
                onChange={(e) => setBorrowerIdentifier(e.target.value)}
                placeholder="Enter borrower identifier"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-warm-taupe">Due Date Override</label>
            <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Faculty Signature Text</label>
            <Input
              value={facultySignature}
              onChange={(e) => setFacultySignature(e.target.value)}
              placeholder="Required for teacher borrowing unless profile has signature"
            />
          </div>
        </div>

        {isFetching && <p className="text-sm text-warm-taupe">Looking up accession...</p>}

        {lookupData?.book && (
          <div className="rounded-md border border-sandy-beige p-4 text-sm">
            <p className="font-semibold text-dark-brown">{lookupData.book.title}</p>
            <p className="font-mono text-xs text-warm-taupe">Accession: {lookupData.book.accessionNumber}</p>
            <p className="text-warm-taupe">{lookupData.book.author}</p>
            <p className="text-warm-taupe">Available: {lookupData.book.availableCopies}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lookupData.book.isArchived && <Badge variant="danger">Archived</Badge>}
              {lookupData.activeLoan ? (
                <>
                  <Badge variant={lookupData.activeLoan.isOverdue ? 'danger' : 'warning'}>
                    {displayStatus(lookupData.activeLoan)}
                  </Badge>
                  <span className="text-warm-taupe">Borrower: {borrowerLabel(lookupData.activeLoan)}</span>
                  <span className="text-warm-taupe">Due: {formatDate(lookupData.activeLoan.dueAt)}</span>
                </>
              ) : (
                <Badge variant="success">Currently Available</Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleIssue} disabled={isIssuing || !accessionInput.trim()}>
            {isIssuing ? 'Issuing...' : 'Issue Book'}
          </Button>
          <Button variant="secondary" onClick={() => handleReturn()} disabled={isReturning || !lookupData?.activeLoan}>
            {isReturning ? 'Returning...' : 'Return Book'}
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dark-brown">Active Loans</h2>
            <p className="text-sm text-warm-taupe">Search by borrower, accession, title, student reg number, or teacher ID.</p>
          </div>
          <form onSubmit={applyLoanSearch} className="flex flex-wrap items-center gap-2">
            <Input value={loanSearchInput} onChange={(e) => setLoanSearchInput(e.target.value)} placeholder="Search loans" />
            <label className="flex items-center gap-2 text-sm text-warm-taupe">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => {
                  setOverdueOnly(e.target.checked);
                  setPage(1);
                }}
              />
              Overdue only
            </label>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </div>

        {isLoadingLoans && <LoadingState message="Loading active loans..." />}
        {isLoansError && <ErrorState message="Failed to load loans." onRetry={refetchLoans} />}
        {!isLoadingLoans && !isLoansError && loans && loans.items.length === 0 && (
          <EmptyState message="No circulation records match these filters." />
        )}
        {!isLoadingLoans && !isLoansError && loans && loans.items.length > 0 && (
          <>
            {renderLoanRows(loans.items)}
            {loans.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-sandy-beige/70 pt-4">
                <span className="text-sm text-warm-taupe">Page {loans.page} of {loans.totalPages}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" disabled={loans.page === 1} onClick={() => setPage((prev) => prev - 1)}>
                    Prev
                  </Button>
                  <Button size="sm" variant="ghost" disabled={loans.page === loans.totalPages} onClick={() => setPage((prev) => prev + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-dark-brown">Borrower History</h2>
          {!selectedBorrowerId && <EmptyState message="Select a loan borrower to view history." />}
          {selectedBorrowerId && (!borrowerHistory || borrowerHistory.length === 0) && (
            <EmptyState message="No borrower history found." />
          )}
          {borrowerHistory && borrowerHistory.length > 0 && renderLoanRows(borrowerHistory)}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-dark-brown">Book Circulation History</h2>
          {!selectedBookId && <EmptyState message="Select a book to view circulation history." />}
          {selectedBookId && (!bookHistory || bookHistory.length === 0) && (
            <EmptyState message="No book circulation history found." />
          )}
          {bookHistory && bookHistory.length > 0 && renderLoanRows(bookHistory)}
        </Card>
      </div>
    </div>
  );
};

export default AdminCirculationPage;

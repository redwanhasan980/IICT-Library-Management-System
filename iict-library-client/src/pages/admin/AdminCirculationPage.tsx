import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Badge } from '../../components/shared/Badge';
import { useIssueLoanMutation, useLookupByAccessionQuery, useReturnLoanMutation } from '../../services/library.api';

const AdminCirculationPage = () => {
  const [accessionInput, setAccessionInput] = useState('');
  const [activeAccession, setActiveAccession] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [facultySignature, setFacultySignature] = useState('');

  const { data: lookupData, isFetching } = useLookupByAccessionQuery(activeAccession, {
    skip: !activeAccession,
  });

  const [issueLoan, { isLoading: isIssuing }] = useIssueLoanMutation();
  const [returnLoan, { isLoading: isReturning }] = useReturnLoanMutation();

  useEffect(() => {
    const trim = accessionInput.trim();
    if (!trim) {
      return;
    }

    const timer = setTimeout(() => {
      setActiveAccession(trim);
    }, 200);

    return () => clearTimeout(timer);
  }, [accessionInput]);

  const handleIssue = async () => {
    if (!lookupData?.book?.id || !borrowerId.trim()) {
      toast.error('Provide borrower user ID and valid accession number');
      return;
    }

    try {
      await issueLoan({ 
        bookId: lookupData.book.id, 
        userId: borrowerId.trim(),
        facultySignatureText: facultySignature.trim() || undefined
      }).unwrap();
      toast.success('Loan issued successfully');
      setBorrowerId('');
      setFacultySignature('');
    } catch {
      toast.error('Failed to issue loan');
    }
  };

  const handleReturn = async () => {
    if (!lookupData?.activeLoan?.id) {
      toast.error('No active loan for this accession');
      return;
    }

    try {
      await returnLoan(lookupData.activeLoan.id).unwrap();
      toast.success('Loan returned successfully');
    } catch {
      toast.error('Failed to return loan');
    }
  };

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
            <label className="text-sm text-warm-taupe">Borrower User ID (for issue)</label>
            <Input
              value={borrowerId}
              onChange={(e) => setBorrowerId(e.target.value)}
              placeholder="Paste borrower ID"
            />
          </div>
        </div>

        <div>
           <label className="text-sm text-warm-taupe">Faculty Signature Text (Required for Teachers)</label>
           <Input
              value={facultySignature}
              onChange={(e) => setFacultySignature(e.target.value)}
              placeholder="Faculty Signature or initial"
           />
        </div>

        {isFetching && <p className="text-sm text-warm-taupe">Looking up accession...</p>}

        {lookupData?.book && (
          <div className="rounded-md border border-sandy-beige p-4 text-sm">
            <p className="font-semibold text-dark-brown">{lookupData.book.title}</p>
            <p className="text-warm-taupe">{lookupData.book.author}</p>
            <p className="text-warm-taupe">Available: {lookupData.book.availableCopies}</p>
            <div className="mt-2">
              {lookupData.activeLoan ? <Badge variant="warning">Currently Issued</Badge> : <Badge variant="success">Currently Available</Badge>}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleIssue} disabled={isIssuing || !lookupData?.book}>Issue Book</Button>
          <Button variant="secondary" onClick={handleReturn} disabled={isReturning || !lookupData?.activeLoan}>Return Book</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminCirculationPage;

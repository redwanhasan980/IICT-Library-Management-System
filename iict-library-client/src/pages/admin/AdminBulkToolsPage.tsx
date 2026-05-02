import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { useExportResourceCsvMutation, useImportBooksCsvMutation } from '../../services/library.api';

const defaultCsvTemplate = `accessionNumber,title,author,isbn,department,totalCopies\nACC-1001,Database Systems,Abraham Silberschatz,9780073523323,CSE,2`;

const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const AdminBulkToolsPage = () => {
  const [csvText, setCsvText] = useState(defaultCsvTemplate);
  const [importBooksCsv, { isLoading: isImporting, data: importSummary }] = useImportBooksCsvMutation();
  const [exportResource, { isLoading: isExporting }] = useExportResourceCsvMutation();

  const handleImport = async () => {
    try {
      await importBooksCsv({ csv: csvText }).unwrap();
      toast.success('Book import completed');
    } catch {
      toast.error('Book import failed');
    }
  };

  const handleExport = async (resource: 'books' | 'loans' | 'outside-books' | 'members') => {
    try {
      const csv = await exportResource(resource).unwrap();
      downloadCsv(`${resource}-export.csv`, csv);
      toast.success(`${resource} exported`);
    } catch {
      toast.error(`Failed to export ${resource}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Bulk Import, Export, and Archival Tools</h1>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">Book CSV Import</h2>
        <p className="text-sm text-warm-taupe">
          Template columns: accessionNumber, title, author, isbn, department, totalCopies
        </p>
        <textarea
          className="min-h-52 w-full border-2 border-library-ink bg-paper-soft p-3 font-mono text-sm text-library-ink shadow-[2px_2px_0_#1a1c1a] focus:outline-none focus:ring-2 focus:ring-library-forest/40"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <Button onClick={handleImport} disabled={isImporting}>{isImporting ? 'Importing...' : 'Import Books CSV'}</Button>
        {importSummary && (
          <div className="border-2 border-library-ink bg-pale-cream p-3 text-sm font-semibold text-dark-brown shadow-[2px_2px_0_#1a1c1a]">
            Rows: {importSummary.rowsProcessed} | Created: {importSummary.created} | Updated: {importSummary.updated} | Errors: {importSummary.errors.length}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-dark-brown">CSV Export</h2>
        <p className="text-sm text-warm-taupe">Download operational datasets for offline work and reporting.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => handleExport('books')} disabled={isExporting}>Export Books</Button>
          <Button variant="secondary" onClick={() => handleExport('loans')} disabled={isExporting}>Export Loans</Button>
          <Button variant="secondary" onClick={() => handleExport('outside-books')} disabled={isExporting}>Export Outside Book Logs</Button>
          <Button variant="secondary" onClick={() => handleExport('members')} disabled={isExporting}>Export Members</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminBulkToolsPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useListBooksQuery, useSetBookArchiveStatusMutation } from '../../../services/library.api';
import { Card } from '../../../components/shared/Card';
import { Button } from '../../../components/shared/Button';
import { Input } from '../../../components/shared/Input';
import { Badge } from '../../../components/shared/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/shared/Table';
import { ErrorState, LoadingState } from '../../../components/shared/FeedbackState';
import { getBookThumbnailSrc } from '../../../utils/bookImage';

const AdminCatalogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [queryTerm, setQueryTerm] = useState('');
  const [includeArchived, setIncludeArchived] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, refetch } = useListBooksQuery({
    q: queryTerm,
    includeArchived,
    page,
    pageSize,
  });

  const [setArchiveStatus] = useSetBookArchiveStatusMutation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryTerm(searchTerm);
    setPage(1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setQueryTerm('');
    setIncludeArchived(true);
    setPage(1);
  };

  const handleToggleArchive = async (id: string, currentStatus: boolean) => {
    const actionLabel = currentStatus ? 'restore' : 'archive';
    if (window.confirm(`Are you sure you want to ${actionLabel} this book?`)) {
      try {
        await setArchiveStatus({ id, isArchived: !currentStatus }).unwrap();
      } catch (err) {
        console.error('Failed to toggle status', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-brown">Manage Books</h1>
          <p className="text-sm text-warm-taupe">Add, edit, or archive books in the library catalog.</p>
        </div>
        <Link to="/dashboard/admin/catalog/new">
          <Button variant="primary">Add New Book</Button>
        </Link>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="search" className="text-sm text-warm-taupe">Search Title, Author, Accession, ISBN</label>
            <Input
              id="search"
              placeholder="Search term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center pb-2">
            <label className="flex items-center gap-2 text-sm text-dark-brown">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => {
                  setIncludeArchived(e.target.checked);
                  setPage(1);
                }}
                className="border-2 border-library-ink text-dark-brown focus:ring-dark-brown"
              />
              Show Archived
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Search</Button>
            <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </form>
      </Card>

      <Card>
        {isLoading && <LoadingState message="Loading catalog..." />}
        {isError && <ErrorState message="Failed to load catalog." onRetry={refetch} />}

        {!isLoading && !isError && data && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cover</TableHead>
                  <TableHead>Accession</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center italic text-warm-taupe py-6">
                      No books found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <img
                          src={getBookThumbnailSrc(book)}
                          alt={`Cover for ${book.title}`}
                          className="h-14 w-10 border-2 border-library-ink bg-library-mist object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{book.accessionNumber}</TableCell>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        {book.isArchived ? (
                          <Badge variant="warning">Archived</Badge>
                        ) : book.availableCopies > 0 ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="error">Checkout</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/admin/catalog/${book.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={book.isArchived ? 'secondary' : 'outline'}
                          className={!book.isArchived ? 'text-red-600 hover:bg-red-50' : ''}
                          size="sm"
                          onClick={() => handleToggleArchive(book.id, book.isArchived)}
                        >
                          {book.isArchived ? 'Restore' : 'Archive'}
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t-2 border-library-ink px-4 pt-4">
                <span className="text-sm text-warm-taupe">
                  Page {data.page} of {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page === data.totalPages}
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminCatalogPage;

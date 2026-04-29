import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateBookMutation,
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useUploadBookImagesMutation,
} from '../../../services/library.api';
import { Card } from '../../../components/shared/Card';
import { Button } from '../../../components/shared/Button';
import { Input } from '../../../components/shared/Input';
import { LoadingState, ErrorState } from '../../../components/shared/FeedbackState';
import type { Book } from '../../../types/book.types';
import { getApiErrorMessage } from '../../../utils/apiError';
import BookImageManager from '../../../components/books/BookImageManager';

const AdminBookFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: bookDetails, isLoading: isFetching, isError: isFetchError } = useGetBookByIdQuery(id as string, { skip: !isEditing });
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [uploadBookImages, { isLoading: isUploadingImages }] = useUploadBookImagesMutation();

  const isSaving = isCreating || isUpdating || isUploadingImages;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    accessionNumber: '',
    isbn: '',
    publisher: '',
    placeOfPublication: '',
    edition: '',
    volume: '',
    dateOfPublication: '',
    source: 'PURCHASE',
    binding: 'HB',
    pagination: '',
    billNumber: '',
    billDate: '',
    department: 'SWE',
    subjectCategory: '',
    deweyDecimalNumber: '',
    cutterCode: '',
    callNumber: '',
    barcode: '',
    coverImageUrl: '',
    locationCode: '',
    totalCopies: 1,
  });

  const [errorDesc, setErrorDesc] = useState('');
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isEditing && bookDetails) {
      setFormData({
        title: bookDetails.title || '',
        author: bookDetails.author || '',
        accessionNumber: bookDetails.accessionNumber || '',
        isbn: bookDetails.isbn || '',
        publisher: bookDetails.publisher || '',
        placeOfPublication: bookDetails.placeOfPublication || '',
        edition: bookDetails.edition || '',
        volume: bookDetails.volume || '',
        dateOfPublication: bookDetails.dateOfPublication ? bookDetails.dateOfPublication.split('T')[0] : '',
        source: bookDetails.source || 'PURCHASE',
        binding: bookDetails.binding || 'HB',
        pagination: bookDetails.pagination ? String(bookDetails.pagination) : '',
        billNumber: bookDetails.billNumber || '',
        billDate: bookDetails.billDate ? bookDetails.billDate.split('T')[0] : '',
        department: bookDetails.department || 'SWE',
        subjectCategory: bookDetails.subjectCategory || '',
        deweyDecimalNumber: bookDetails.deweyDecimalNumber ? String(bookDetails.deweyDecimalNumber) : '',
        cutterCode: bookDetails.cutterCode || '',
        callNumber: bookDetails.callNumber || '',
        barcode: bookDetails.barcode || '',
        coverImageUrl: bookDetails.coverImageUrl || '',
        locationCode: bookDetails.locationCode || '',
        totalCopies: bookDetails.totalCopies || 1,
      });
    }
  }, [isEditing, bookDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDesc('');

    const payload = {
      ...formData,
      pagination: formData.pagination ? parseInt(formData.pagination as string, 10) : undefined,
      totalCopies: parseInt(String(formData.totalCopies), 10),
      deweyDecimalNumber: formData.deweyDecimalNumber ? parseFloat(formData.deweyDecimalNumber as string) : undefined,
    } as Partial<Book>;

    // basic cleanup for missing
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === '') {
        delete payload[key as keyof typeof payload];
      }
    });

    try {
      let savedBook: Book;
      if (isEditing && id) {
        savedBook = await updateBook({ id, body: payload }).unwrap();
      } else {
        savedBook = await createBook(payload).unwrap();
      }

      if (selectedImageFiles.length > 0) {
        await uploadBookImages({ bookId: savedBook.id, files: selectedImageFiles }).unwrap();
      }

      setSelectedImageFiles([]);
      navigate('/dashboard/admin/catalog');
    } catch (err: unknown) {
      setErrorDesc(getApiErrorMessage(err, 'Failed to save book. Check accession number and fields.'));
    }
  };

  if (isEditing && isFetching) return <LoadingState message="Loading book details..." />;
  if (isEditing && isFetchError) return <ErrorState message="Could not load book." onRetry={() => navigate('/dashboard/admin/catalog')} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">{isEditing ? 'Edit Book' : 'Add New Book'}</h1>
        <p className="text-sm text-warm-taupe">Fill in the book metadata and classification details.</p>
      </div>

      <Card className="p-6">
        {errorDesc && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{errorDesc}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 text-lg font-semibold border-b pb-2">Core Identity</div>
            <div>
              <label className="text-sm">Title *</label>
              <Input name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm">Author *</label>
              <Input name="author" value={formData.author} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm">Accession Number *</label>
              <Input name="accessionNumber" value={formData.accessionNumber} onChange={handleChange} required />
            </div>
            <div>
              <label className="text-sm">ISBN</label>
              <Input name="isbn" value={formData.isbn} onChange={handleChange} />
            </div>
            
            <div className="md:col-span-2 text-lg font-semibold border-b pb-2 mt-4">Publication Details</div>
            <div>
              <label className="text-sm">Publisher</label>
              <Input name="publisher" value={formData.publisher} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Place of Publication</label>
              <Input name="placeOfPublication" value={formData.placeOfPublication} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Edition</label>
              <Input name="edition" value={formData.edition} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Volume</label>
              <Input name="volume" value={formData.volume} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Date of Publication</label>
              <Input name="dateOfPublication" type="date" value={formData.dateOfPublication} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Pagination (pages)</label>
              <Input name="pagination" type="number" value={formData.pagination} onChange={handleChange} />
            </div>

            <div className="md:col-span-2 text-lg font-semibold border-b pb-2 mt-4">Classification & Physical</div>
            <div>
              <label className="text-sm">Department *</label>
              <select name="department" value={formData.department} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded p-2 text-sm text-dark-brown focus:border-dark-brown focus:outline-none focus:ring-1 focus:ring-dark-brown">
                <option value="SWE">SWE</option>
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Subject Category</label>
              <Input name="subjectCategory" value={formData.subjectCategory} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Dewey Decimal (DDC)</label>
              <Input name="deweyDecimalNumber" type="number" step="0.001" value={formData.deweyDecimalNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Call Number</label>
              <Input name="callNumber" value={formData.callNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Location Code</label>
              <Input name="locationCode" value={formData.locationCode} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Barcode</label>
              <Input name="barcode" value={formData.barcode} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Cover Image URL</label>
              <Input name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} placeholder="/images/book-cover-placeholder.svg" />
            </div>
            <div>
              <label className="text-sm">Total Copies *</label>
              <Input name="totalCopies" type="number" min={1} value={formData.totalCopies} onChange={handleChange} required />
            </div>
            
            <div className="md:col-span-2 text-lg font-semibold border-b pb-2 mt-4">Procurement & Source</div>
            <div>
              <label className="text-sm">Source</label>
              <select name="source" value={formData.source} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded p-2 text-sm text-dark-brown focus:border-dark-brown focus:outline-none focus:ring-1 focus:ring-dark-brown">
                <option value="PURCHASE">Purchase</option>
                <option value="DONATION">Donation</option>
                <option value="GIFT">Gift</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Bill / Receipt Number</label>
              <Input name="billNumber" value={formData.billNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Bill Date</label>
              <Input name="billDate" type="date" value={formData.billDate} onChange={handleChange} />
            </div>
          </div>

          <BookImageManager
            bookId={id}
            images={bookDetails?.images}
            selectedFiles={selectedImageFiles}
            onSelectedFilesChange={setSelectedImageFiles}
            isSaving={isSaving}
          />

          <div className="flex justify-end gap-4 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/admin/catalog')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Book'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminBookFormPage;

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../shared/Button';
import { EmptyState } from '../shared/FeedbackState';
import type { BookImage } from '../../types/book.types';
import { useDeleteBookImageMutation, useReorderBookImagesMutation } from '../../services/library.api';
import { getApiErrorMessage } from '../../utils/apiError';

interface BookImageManagerProps {
  bookId?: string;
  images?: BookImage[];
  selectedFiles: File[];
  onSelectedFilesChange: (files: File[]) => void;
  isSaving?: boolean;
}

const BookImageManager = ({
  bookId,
  images = [],
  selectedFiles,
  onSelectedFilesChange,
  isSaving = false,
}: BookImageManagerProps) => {
  const [error, setError] = useState('');
  const [deleteImage, { isLoading: isDeleting }] = useDeleteBookImageMutation();
  const [reorderImages, { isLoading: isReordering }] = useReorderBookImagesMutation();
  const isBusy = isSaving || isDeleting || isReordering;

  const previews = useMemo(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    onSelectedFilesChange([...selectedFiles, ...files]);
    event.target.value = '';
  };

  const handleRemoveSelected = (index: number) => {
    onSelectedFilesChange(selectedFiles.filter((_file, fileIndex) => fileIndex !== index));
  };

  const handleDeleteExisting = async (imageId: string) => {
    if (!bookId || !window.confirm('Remove this book image?')) {
      return;
    }

    setError('');
    try {
      await deleteImage({ bookId, imageId }).unwrap();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to remove image.'));
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!bookId) {
      return;
    }

    setError('');
    try {
      await reorderImages({
        bookId,
        imageIds: [imageId, ...images.filter((image) => image.id !== imageId).map((image) => image.id)],
        primaryImageId: imageId,
      }).unwrap();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to set primary image.'));
    }
  };

  const handleMove = async (imageId: string, direction: -1 | 1) => {
    if (!bookId) {
      return;
    }

    const currentIndex = images.findIndex((image) => image.id === imageId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const nextImages = [...images];
    [nextImages[currentIndex], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[currentIndex]];

    setError('');
    try {
      await reorderImages({
        bookId,
        imageIds: nextImages.map((image) => image.id),
        primaryImageId: nextImages.find((image) => image.isPrimary)?.id,
      }).unwrap();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reorder images.'));
    }
  };

  return (
    <div className="space-y-4 border-2 border-library-ink bg-library-mist p-4 shadow-[3px_3px_0_#1a1c1a]">
      <div>
        <h2 className="text-lg font-semibold text-dark-brown">Book Images</h2>
        <p className="text-sm text-warm-taupe">
          Upload book cover or page images. Cloudinary stores and optimizes them for display.
        </p>
      </div>

      {error ? <div className="border-2 border-rose-950 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</div> : null}

      <label className="block">
        <span className="text-sm font-medium text-dark-brown">Select Images</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isBusy}
          onChange={handleFileChange}
          className="mt-2 block w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink file:mr-3 file:border-2 file:border-library-ink file:bg-library-mist file:px-3 file:py-1.5 file:text-sm file:font-extrabold file:text-library-ink hover:file:bg-pale-cream"
        />
      </label>

      {selectedFiles.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-dark-brown">Selected for upload after save</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
                <img
                  src={preview.url}
                  alt={`Selected ${preview.file.name}`}
                  className="aspect-[9/13] w-full border-2 border-library-ink bg-library-mist object-cover"
                />
                <p className="mt-2 truncate text-xs font-semibold text-library-ink">{preview.file.name}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  disabled={isBusy}
                  onClick={() => handleRemoveSelected(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {bookId ? (
        images.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-dark-brown">Uploaded Images</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {images.map((image, index) => (
                <div key={image.id} className="border-2 border-library-ink bg-pale-cream p-3 shadow-[3px_3px_0_#1a1c1a]">
                  <img
                    src={image.thumbnailUrl}
                    alt={`Book image ${index + 1}`}
                    className="aspect-[9/13] w-full border-2 border-library-ink bg-library-mist object-cover"
                  />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-library-ink">
                      {image.isPrimary ? 'Primary' : `Image ${index + 1}`}
                    </span>
                    <span className="text-xs uppercase text-warm-taupe">{image.format || 'image'}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy || index === 0}
                      onClick={() => handleMove(image.id, -1)}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy || index === images.length - 1}
                      onClick={() => handleMove(image.id, 1)}
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isBusy || image.isPrimary}
                      onClick={() => handleSetPrimary(image.id)}
                    >
                      Primary
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-rose-950 bg-rose-50 text-rose-800 hover:bg-rose-100"
                      disabled={isBusy}
                      onClick={() => handleDeleteExisting(image.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState message="No uploaded book images yet." />
        )
      ) : (
        <p className="text-sm text-warm-taupe">Images will upload after the new book record is saved.</p>
      )}
    </div>
  );
};

export default BookImageManager;

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BookImageManager from './BookImageManager';
import type { BookImage } from '../../types/book.types';

const mocks = vi.hoisted(() => ({
  deleteImage: vi.fn(),
  reorderImages: vi.fn(),
}));

vi.mock('../../services/library.api', () => ({
  useDeleteBookImageMutation: () => [mocks.deleteImage, { isLoading: false }],
  useReorderBookImagesMutation: () => [mocks.reorderImages, { isLoading: false }],
}));

const images: BookImage[] = [
  {
    id: 'image-1',
    bookId: 'book-1',
    cloudinaryPublicId: 'public-1',
    secureUrl: 'https://example.com/cover.jpg',
    thumbnailUrl: 'https://example.com/cover-thumb.jpg',
    coverUrl: 'https://example.com/cover-card.jpg',
    detailUrl: 'https://example.com/cover-detail.jpg',
    format: 'jpg',
    sortOrder: 0,
    isPrimary: true,
    createdAt: '2026-04-30T00:00:00.000Z',
  },
  {
    id: 'image-2',
    bookId: 'book-1',
    cloudinaryPublicId: 'public-2',
    secureUrl: 'https://example.com/back.jpg',
    thumbnailUrl: 'https://example.com/back-thumb.jpg',
    coverUrl: 'https://example.com/back-card.jpg',
    detailUrl: 'https://example.com/back-detail.jpg',
    format: 'jpg',
    sortOrder: 1,
    isPrimary: false,
    createdAt: '2026-04-30T00:00:00.000Z',
  },
];

const renderManager = (selectedFiles: File[] = []) => {
  const onSelectedFilesChange = vi.fn();
  const result = render(
    <BookImageManager
      bookId="book-1"
      images={images}
      selectedFiles={selectedFiles}
      onSelectedFilesChange={onSelectedFilesChange}
    />
  );

  return { ...result, onSelectedFilesChange };
};

describe('BookImageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteImage.mockReturnValue({ unwrap: vi.fn().mockResolvedValue([]) });
    mocks.reorderImages.mockReturnValue({ unwrap: vi.fn().mockResolvedValue([]) });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn() });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders existing images and selected upload previews', () => {
    const file = new File(['image'], 'cover.png', { type: 'image/png' });
    renderManager([file]);

    expect(screen.getByText('Uploaded Images')).toBeInTheDocument();
    expect(screen.getAllByText('Primary').length).toBeGreaterThan(0);
    expect(screen.getByText('Selected for upload after save')).toBeInTheDocument();
    expect(screen.getByText('cover.png')).toBeInTheDocument();
  });

  it('adds selected files to the pending upload list', () => {
    const { container, onSelectedFilesChange } = renderManager();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['image'], 'new-cover.webp', { type: 'image/webp' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelectedFilesChange).toHaveBeenCalledWith([file]);
  });

  it('calls image management mutations for primary and delete actions', async () => {
    renderManager();

    fireEvent.click(screen.getAllByRole('button', { name: 'Primary' })[1]);
    await waitFor(() => {
      expect(mocks.reorderImages).toHaveBeenCalledWith({
        bookId: 'book-1',
        imageIds: ['image-2', 'image-1'],
        primaryImageId: 'image-2',
      });
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => {
      expect(mocks.deleteImage).toHaveBeenCalledWith({ bookId: 'book-1', imageId: 'image-1' });
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
    book: { findUnique: vi.fn() },
    bookImage: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
  cloudinary: {
    uploader: {
      upload: vi.fn(),
      destroy: vi.fn(),
    },
  },
  assertCloudinaryConfigured: vi.fn(),
  unlink: vi.fn(),
  logAuditEvent: vi.fn(),
}));

vi.mock('../config/database', () => ({ default: mocks.prisma }));
vi.mock('../config/cloudinary', () => ({
  default: mocks.cloudinary,
  assertCloudinaryConfigured: mocks.assertCloudinaryConfigured,
}));
vi.mock('fs/promises', () => ({ default: { unlink: mocks.unlink } }));
vi.mock('../utils/auditLog', () => ({ logAuditEvent: mocks.logAuditEvent }));

const { default: bookImageService, mapBookImage } = await import('./bookImage.service');

const uploadedImage = {
  id: 'image-1',
  bookId: 'book-1',
  cloudinaryPublicId: 'iict-lms/books/book-1/cover',
  assetId: 'asset-1',
  secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/iict-lms/books/book-1/cover.jpg',
  format: 'jpg',
  width: 1200,
  height: 1600,
  bytes: 45000,
  sortOrder: 0,
  isPrimary: true,
  createdAt: new Date('2026-04-30T00:00:00.000Z'),
  updatedAt: new Date('2026-04-30T00:00:00.000Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.book.findUnique.mockResolvedValue({ id: 'book-1', accessionNumber: 'ACC-1' });
  mocks.prisma.bookImage.findMany.mockResolvedValue([uploadedImage]);
  mocks.cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
});

describe('bookImageService', () => {
  it('maps Cloudinary delivery transformations for display sizes', () => {
    const mapped = mapBookImage(uploadedImage);

    expect(mapped.thumbnailUrl).toContain('/upload/c_fit,w_180,h_270,f_auto,q_auto/');
    expect(mapped.coverUrl).toContain('/upload/c_fit,w_420,h_630,f_auto,q_auto/');
    expect(mapped.detailUrl).toContain('/upload/c_fit,w_1200,h_1400,f_auto,q_auto/');
  });

  it('uploads multiple images and makes the first image primary when none exists', async () => {
    mocks.cloudinary.uploader.upload
      .mockResolvedValueOnce({
        public_id: 'public-1',
        asset_id: 'asset-1',
        secure_url: uploadedImage.secureUrl,
        format: 'jpg',
        width: 1200,
        height: 1600,
        bytes: 45000,
      })
      .mockResolvedValueOnce({
        public_id: 'public-2',
        asset_id: 'asset-2',
        secure_url: uploadedImage.secureUrl.replace('cover', 'back'),
        format: 'jpg',
        width: 1200,
        height: 1600,
        bytes: 42000,
      });
    mocks.prisma.bookImage.count.mockResolvedValue(0);
    mocks.prisma.bookImage.findFirst.mockResolvedValue(null);
    mocks.prisma.bookImage.create.mockResolvedValue(uploadedImage);

    const result = await bookImageService.uploadImages('admin-1', 'book-1', [
      { path: 'tmp/cover.jpg', originalname: 'cover.jpg' },
      { path: 'tmp/back.jpg', originalname: 'back.jpg' },
    ] as Express.Multer.File[]);

    expect(mocks.cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
    expect(mocks.prisma.bookImage.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
      data: expect.objectContaining({ cloudinaryPublicId: 'public-1', isPrimary: true, sortOrder: 0 }),
    }));
    expect(mocks.prisma.bookImage.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: expect.objectContaining({ cloudinaryPublicId: 'public-2', isPrimary: false, sortOrder: 1 }),
    }));
    expect(mocks.unlink).toHaveBeenCalledTimes(2);
    expect(result[0].id).toBe('image-1');
  });

  it('deletes an image from Cloudinary and promotes the next image when primary is removed', async () => {
    mocks.prisma.bookImage.findFirst
      .mockResolvedValueOnce(uploadedImage)
      .mockResolvedValueOnce({ ...uploadedImage, id: 'image-2', isPrimary: false });
    mocks.prisma.bookImage.delete.mockResolvedValue(uploadedImage);
    mocks.prisma.bookImage.update.mockResolvedValue({ ...uploadedImage, id: 'image-2', isPrimary: true });

    await bookImageService.deleteImage('admin-1', 'book-1', 'image-1');

    expect(mocks.cloudinary.uploader.destroy).toHaveBeenCalledWith(uploadedImage.cloudinaryPublicId, { resource_type: 'image' });
    expect(mocks.prisma.bookImage.delete).toHaveBeenCalledWith({ where: { id: 'image-1' } });
    expect(mocks.prisma.bookImage.update).toHaveBeenCalledWith({
      where: { id: 'image-2' },
      data: { isPrimary: true },
    });
  });

  it('reorders images and sets the requested primary image', async () => {
    mocks.prisma.bookImage.findMany.mockResolvedValue([
      { ...uploadedImage, id: 'image-1', isPrimary: true },
      { ...uploadedImage, id: 'image-2', isPrimary: false },
    ]);
    mocks.prisma.bookImage.updateMany.mockResolvedValue({ count: 2 });
    mocks.prisma.bookImage.update.mockResolvedValue(uploadedImage);

    await bookImageService.reorderImages('admin-1', 'book-1', ['image-2', 'image-1'], 'image-2');

    expect(mocks.prisma.bookImage.updateMany).toHaveBeenCalledWith({
      where: { bookId: 'book-1' },
      data: { isPrimary: false },
    });
    expect(mocks.prisma.bookImage.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'image-2' },
      data: { sortOrder: 0, isPrimary: true },
    });
  });
});

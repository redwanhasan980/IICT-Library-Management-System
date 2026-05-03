import fs from 'fs/promises';
import type { UploadApiResponse } from 'cloudinary';
import type { BookImage } from '@prisma/client';
import prisma from '../config/database';
import cloudinary, { assertCloudinaryConfigured } from '../config/cloudinary';
import AppError from '../utils/AppError';
import { logAuditEvent } from '../utils/auditLog';

export interface BookImageDto {
  id: string;
  bookId: string;
  cloudinaryPublicId: string;
  assetId?: string | null;
  secureUrl: string;
  thumbnailUrl: string;
  coverUrl: string;
  detailUrl: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

const addTransformation = (secureUrl: string, transformation: string) => {
  if (!secureUrl.includes('/upload/')) {
    return secureUrl;
  }

  return secureUrl.replace('/upload/', `/upload/${transformation}/`);
};

export const mapBookImage = (image: BookImage): BookImageDto => ({
  id: image.id,
  bookId: image.bookId,
  cloudinaryPublicId: image.cloudinaryPublicId,
  assetId: image.assetId,
  secureUrl: image.secureUrl,
  thumbnailUrl: addTransformation(image.secureUrl, 'c_fit,w_180,h_270,f_auto,q_auto'),
  coverUrl: addTransformation(image.secureUrl, 'c_fit,w_420,h_630,f_auto,q_auto'),
  detailUrl: addTransformation(image.secureUrl, 'c_fit,w_1200,h_1400,f_auto,q_auto'),
  format: image.format,
  width: image.width,
  height: image.height,
  bytes: image.bytes,
  sortOrder: image.sortOrder,
  isPrimary: image.isPrimary,
  createdAt: image.createdAt,
});

export const getPrimaryBookImage = (images?: BookImage[]) => {
  if (!images?.length) {
    return undefined;
  }

  const primary = images.find((image) => image.isPrimary) ?? images[0];
  return mapBookImage(primary);
};

class BookImageService {
  private async assertBookExists(bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, accessionNumber: true },
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    return book;
  }

  private async removeTempFiles(files: Express.Multer.File[]) {
    await Promise.allSettled(files.map((file) => fs.unlink(file.path)));
  }

  private async destroyUploadedImages(uploaded: UploadApiResponse[]) {
    await Promise.allSettled(
      uploaded.map((image) =>
        cloudinary.uploader.destroy(image.public_id, { resource_type: 'image' })
      )
    );
  }

  private async listImages(bookId: string) {
    const images = await prisma.bookImage.findMany({
      where: { bookId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return images.map(mapBookImage);
  }

  async uploadImages(actorId: string, bookId: string, files: Express.Multer.File[]) {
    if (!files.length) {
      throw new AppError('Select at least one image to upload.', 400);
    }

    const book = await this.assertBookExists(bookId);
    assertCloudinaryConfigured();

    const uploaded: UploadApiResponse[] = [];

    try {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `iict-lms/books/${book.id}`,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          transformation: [{ width: 1800, height: 2400, crop: 'limit', quality: 'auto' }],
        });
        uploaded.push(result);
      }

      const [existingCount, existingPrimary] = await Promise.all([
        prisma.bookImage.count({ where: { bookId } }),
        prisma.bookImage.findFirst({ where: { bookId, isPrimary: true }, select: { id: true } }),
      ]);

      await prisma.$transaction(
        uploaded.map((image, index) =>
          prisma.bookImage.create({
            data: {
              bookId,
              cloudinaryPublicId: image.public_id,
              assetId: image.asset_id,
              secureUrl: image.secure_url,
              format: image.format,
              width: image.width,
              height: image.height,
              bytes: image.bytes,
              sortOrder: existingCount + index,
              isPrimary: !existingPrimary && index === 0,
            },
          })
        )
      );

      logAuditEvent({
        action: 'book.images.upload',
        actorId,
        entity: 'Book',
        entityId: bookId,
        details: { accessionNumber: book.accessionNumber, count: uploaded.length },
      });

      return this.listImages(bookId);
    } catch (error) {
      await this.destroyUploadedImages(uploaded);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error instanceof Error ? error.message : 'Failed to upload book images', 502);
    } finally {
      await this.removeTempFiles(files);
    }
  }

  async deleteImage(actorId: string, bookId: string, imageId: string) {
    await this.assertBookExists(bookId);
    const image = await prisma.bookImage.findFirst({ where: { id: imageId, bookId } });

    if (!image) {
      throw new AppError('Book image not found', 404);
    }

    assertCloudinaryConfigured();
    await cloudinary.uploader.destroy(image.cloudinaryPublicId, { resource_type: 'image' });
    await prisma.bookImage.delete({ where: { id: image.id } });

    if (image.isPrimary) {
      const nextImage = await prisma.bookImage.findFirst({
        where: { bookId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
      if (nextImage) {
        await prisma.bookImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    logAuditEvent({
      action: 'book.images.delete',
      actorId,
      entity: 'Book',
      entityId: bookId,
      details: { imageId },
    });

    return this.listImages(bookId);
  }

  async reorderImages(actorId: string, bookId: string, imageIds: string[], primaryImageId?: string) {
    if (imageIds.length === 0) {
      throw new AppError('Provide at least one image ID to reorder.', 400);
    }

    await this.assertBookExists(bookId);

    if (primaryImageId && !imageIds.includes(primaryImageId)) {
      throw new AppError('Primary image must be included in the ordered image list.', 400);
    }

    const existingImages = await prisma.bookImage.findMany({
      where: { bookId, id: { in: imageIds } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    if (existingImages.length !== imageIds.length) {
      throw new AppError('One or more image IDs do not belong to this book.', 400);
    }

    const selectedPrimaryId = primaryImageId ?? existingImages.find((image) => image.isPrimary)?.id ?? imageIds[0];

    await prisma.$transaction([
      prisma.bookImage.updateMany({ where: { bookId }, data: { isPrimary: false } }),
      ...imageIds.map((id, index) =>
        prisma.bookImage.update({
          where: { id },
          data: { sortOrder: index, isPrimary: id === selectedPrimaryId },
        })
      ),
    ]);

    logAuditEvent({
      action: 'book.images.reorder',
      actorId,
      entity: 'Book',
      entityId: bookId,
      details: { count: imageIds.length, primaryImageId: selectedPrimaryId },
    });

    return this.listImages(bookId);
  }
}

export default new BookImageService();

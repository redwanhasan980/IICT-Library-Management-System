import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';
import AppError from '../utils/AppError';

const uploadDir = path.join(os.tmpdir(), 'iict-lms-book-images');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9_-]+/gi, '-')
      .slice(0, 48);
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeBase}${extension}`);
  },
});

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadBookImages = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError('Only JPEG, PNG, and WebP book images are supported.', 400));
      return;
    }

    callback(null, true);
  },
});

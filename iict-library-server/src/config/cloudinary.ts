import { v2 as cloudinary } from 'cloudinary';
import AppError from '../utils/AppError';

const hasCloudinaryUrl = Boolean(process.env.CLOUDINARY_URL);
const hasNamedConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (hasNamedConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (hasCloudinaryUrl) {
  const cloudinaryUrl = new URL(process.env.CLOUDINARY_URL as string);
  cloudinary.config({
    cloud_name: cloudinaryUrl.hostname,
    api_key: decodeURIComponent(cloudinaryUrl.username),
    api_secret: decodeURIComponent(cloudinaryUrl.password),
    secure: true,
  });
}

export const assertCloudinaryConfigured = () => {
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new AppError('Cloudinary is not configured. Set CLOUDINARY_URL or Cloudinary API credentials.', 500);
  }
};

export default cloudinary;

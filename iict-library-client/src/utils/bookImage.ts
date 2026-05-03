import type { Book } from '../types/book.types';
import bookPagePlaceholder from '../../assets/book_page.jpg';

export const BOOK_IMAGE_PLACEHOLDER = bookPagePlaceholder;

export const getBookCoverSrc = (book: Pick<Book, 'primaryImage' | 'coverImageUrl'>) =>
  book.primaryImage?.coverUrl || book.coverImageUrl || BOOK_IMAGE_PLACEHOLDER;

export const getBookThumbnailSrc = (book: Pick<Book, 'primaryImage' | 'coverImageUrl'>) =>
  book.primaryImage?.thumbnailUrl || book.coverImageUrl || BOOK_IMAGE_PLACEHOLDER;

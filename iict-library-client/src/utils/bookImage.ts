import type { Book } from '../types/book.types';

export const BOOK_IMAGE_PLACEHOLDER = '/images/book-cover-placeholder.svg';

export const getBookCoverSrc = (book: Pick<Book, 'primaryImage' | 'coverImageUrl'>) =>
  book.primaryImage?.coverUrl || book.coverImageUrl || BOOK_IMAGE_PLACEHOLDER;

export const getBookThumbnailSrc = (book: Pick<Book, 'primaryImage' | 'coverImageUrl'>) =>
  book.primaryImage?.thumbnailUrl || book.coverImageUrl || BOOK_IMAGE_PLACEHOLDER;

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import authReducer from '../services/auth.slice';

const book = {
  id: 'book-1',
  title: 'Database Systems',
  author: 'Elmasri',
  accessionNumber: 'ACC-1',
  availableCopies: 1,
  totalCopies: 1,
  isArchived: false,
  callNumber: '005.74 ELM',
  subjectCategory: 'Database',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
};

vi.mock('../services/dashboard.api', () => ({
  useGetDashboardHomeQuery: () => ({
    data: {
      stats: {
        totalBooks: 10,
        availableBooks: 7,
        issuedBooks: 2,
        overdueLoans: 1,
        activeOutsideBookEntries: 3,
      },
      featuredBooks: [book],
      recentBooks: [{ ...book, id: 'book-2', title: 'Software Engineering', accessionNumber: 'ACC-2' }],
      popularBooks: [{ ...book, loanCount: 4 }],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../services/library.api', () => ({
  useListRecommendedBooksQuery: () => ({ data: [book] }),
}));

const renderHome = () => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: null, token: null } },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </Provider>
  );
};

describe('HomePage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders dashboard stats, featured books, new arrivals, and popular books', () => {
    renderHome();

    expect(screen.getByText('Total Books')).toBeInTheDocument();
    expect(screen.getByText('Featured Books')).toBeInTheDocument();
    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    expect(screen.getByText('Popular Books')).toBeInTheDocument();
    expect(screen.getAllByText('Database Systems').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Software Engineering').length).toBeGreaterThan(0);
    expect(screen.queryByText('Book Catalog Search')).not.toBeInTheDocument();
    expect(screen.queryByText('Help and Library Rules')).not.toBeInTheDocument();
    expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
  });
});

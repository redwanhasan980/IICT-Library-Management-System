import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Footer from './Footer';
import authReducer from '../../services/auth.slice';

const renderFooter = (role?: 'ADMIN' | 'STUDENT' | 'TEACHER') => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: role ? { id: `${role.toLowerCase()}-1`, email: `${role.toLowerCase()}@example.com`, role } : null,
        token: role ? 'dev-token' : null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </Provider>
  );
};

describe('Footer', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders public quick links and institution details', () => {
    renderFooter();

    expect(screen.getByText('IICT Library Management System')).toBeInTheDocument();
    expect(screen.getByText('Catalog / Search Books')).toBeInTheDocument();
    expect(screen.getByText('Borrowing History')).toBeInTheDocument();
    expect(screen.getByText('Shahjalal University of Science and Technology, Sylhet')).toBeInTheDocument();
    expect(screen.queryByText('Audit Logs')).not.toBeInTheDocument();
  });

  it('renders admin-only footer links for admins', () => {
    renderFooter('ADMIN');

    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });
});

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';
import authReducer from '../../services/auth.slice';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
}));

vi.mock('../../services/auth.api', () => ({
  useLogoutMutation: () => [mocks.logout, { isLoading: false }],
}));

const renderHeader = (role?: 'ADMIN' | 'STUDENT' | 'TEACHER', onOpenModules?: () => void) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: role
          ? { id: `${role.toLowerCase()}-1`, email: `${role.toLowerCase()}@example.com`, name: `${role} User`, role }
          : null,
        token: role ? 'dev-token' : null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Header onOpenModules={onOpenModules} />
      </MemoryRouter>
    </Provider>
  );
};

describe('Header', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders public links for unauthenticated users', () => {
    renderHeader();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText('About Library')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('links the IICT brand to the public home page', () => {
    renderHeader('ADMIN');

    expect(screen.getByText('IICT Library').closest('a')).toHaveAttribute('href', '/');
  });

  it('renders the dashboard module trigger on the right when provided', () => {
    const onOpenModules = vi.fn();
    renderHeader('ADMIN', onOpenModules);

    fireEvent.click(screen.getByRole('button', { name: 'Open all dashboard modules' }));

    expect(onOpenModules).toHaveBeenCalledTimes(1);
    expect(screen.getByText('IICT Library').compareDocumentPosition(screen.getByRole('button', { name: 'Open all dashboard modules' }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('renders admin links only for admins', () => {
    renderHeader('ADMIN');

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Circulation')).toBeInTheDocument();
    expect(screen.getByText('Audit')).toBeInTheDocument();
    expect(screen.queryByText('My Borrowing')).not.toBeInTheDocument();
  });

  it('renders student links without admin controls', () => {
    renderHeader('STUDENT');

    expect(screen.getByText('My Borrowing')).toBeInTheDocument();
    expect(screen.getByText('Outside Book Entry')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Circulation')).not.toBeInTheDocument();
  });

  it('renders teacher links without student-only outside-book entry or admin controls', () => {
    renderHeader('TEACHER');

    expect(screen.getByText('My Borrowing')).toBeInTheDocument();
    expect(screen.queryByText('Outside Book Entry')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('uses the existing logout flow from the profile menu', async () => {
    mocks.logout.mockReturnValue({ unwrap: vi.fn().mockResolvedValue(null) });
    renderHeader('ADMIN');

    fireEvent.click(screen.getByRole('button', { name: /ADMIN User/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mocks.logout).toHaveBeenCalledTimes(1);
    });
  });
});

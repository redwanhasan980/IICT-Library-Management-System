import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Sidebar from './Sidebar';
import authReducer from '../services/auth.slice';

const renderSidebar = (role: 'STUDENT' | 'TEACHER') => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: { id: `${role.toLowerCase()}-1`, email: `${role.toLowerCase()}@example.com`, role },
        token: 'dev-token',
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Sidebar isOpen onClose={() => undefined} />
      </MemoryRouter>
    </Provider>
  );
};

describe('Sidebar role navigation', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not show admin circulation controls to students', () => {
    renderSidebar('STUDENT');

    expect(screen.queryByText('Circulation Desk')).not.toBeInTheDocument();
    expect(screen.getByText('My Borrowing')).toBeInTheDocument();
  });

  it('does not show admin circulation controls to teachers', () => {
    renderSidebar('TEACHER');

    expect(screen.queryByText('Circulation Desk')).not.toBeInTheDocument();
    expect(screen.getByText('My Borrowing')).toBeInTheDocument();
  });
});

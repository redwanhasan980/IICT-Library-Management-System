import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from './RegisterPage';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../services/auth.api', () => ({
  useRegisterMutation: () => [mocks.register, { isLoading: false }],
}));

describe('RegisterPage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('includes student phone number and displays field validation errors', async () => {
    mocks.register.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: {
          errors: [{ path: ['studentRegNumber'], message: 'A student already exists with this registration number' }],
        },
      }),
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Student One' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Student Reg Number'), { target: { value: 'REG-1' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '01700000000' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('studentRegNumber: A student already exists with this registration number');
    });
  });
});

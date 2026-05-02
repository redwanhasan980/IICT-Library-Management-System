import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';
import authReducer from '../services/auth.slice';

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}));

const studentUser = {
  id: 'student-1',
  name: 'Student One',
  email: 'student@example.com',
  role: 'STUDENT' as const,
  isActive: true,
  student: {
    studentRegNumber: 'REG-1',
    phoneNumber: '01700000000',
    department: 'SWE',
    currentSemester: 4,
  },
};

vi.mock('../services/auth.api', () => ({
  useGetMeQuery: () => ({
    data: studentUser,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpdateProfileMutation: () => [mocks.updateProfile, { isLoading: false }],
  useChangePasswordMutation: () => [mocks.changePassword, { isLoading: false }],
}));

const renderProfile = () => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: studentUser,
        token: 'token',
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </Provider>
  );
};

describe('ProfilePage', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders profile edit and password change forms', () => {
    renderProfile();

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Student One')).toBeInTheDocument();
    expect(screen.getByDisplayValue('01700000000')).toBeInTheDocument();
  });

  it('submits profile updates', async () => {
    mocks.updateProfile.mockReturnValue({ unwrap: vi.fn().mockResolvedValue(studentUser) });
    renderProfile();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Student Updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => {
      expect(mocks.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Student Updated',
        email: 'student@example.com',
        phoneNumber: '01700000000',
        department: 'SWE',
        currentSemester: 4,
      }));
    });
  });

  it('submits password changes with current password', async () => {
    mocks.changePassword.mockReturnValue({ unwrap: vi.fn().mockResolvedValue(null) });
    renderProfile();

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'old-password' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'new-password' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'new-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(mocks.changePassword).toHaveBeenCalledWith({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      });
    });
  });
});

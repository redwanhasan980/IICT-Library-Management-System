import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { LoadingState, ErrorState } from '../components/shared/FeedbackState';
import { Input } from '../components/shared/Input';
import { useChangePasswordMutation, useGetMeQuery, useUpdateProfileMutation } from '../services/auth.api';
import { selectCurrentUser } from '../services/auth.slice';
import { useAppSelector } from '../store';
import { Role } from '../types/user.types';
import { getApiErrorMessage } from '../utils/apiError';

const departments = ['CSE', 'SWE', 'EEE'] as const;

interface ProfileFormState {
  name: string;
  email: string;
  phoneNumber: string;
  department: '' | 'CSE' | 'SWE' | 'EEE';
  currentSemester: string;
  designation: string;
  signatureData: string;
}

const emptyProfileForm: ProfileFormState = {
  name: '',
  email: '',
  phoneNumber: '',
  department: '',
  currentSemester: '',
  designation: '',
  signatureData: '',
};

const ProfilePage = () => {
  const cachedUser = useAppSelector(selectCurrentUser);
  const { data: user, isLoading, isError, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const profileUser = user ?? cachedUser;

  useEffect(() => {
    if (!profileUser) {
      return;
    }

    setProfileForm({
      name: profileUser.name || '',
      email: profileUser.email || '',
      phoneNumber: profileUser.student?.phoneNumber || '',
      department: (profileUser.student?.department || profileUser.teacher?.department || '') as ProfileFormState['department'],
      currentSemester: profileUser.student?.currentSemester ? String(profileUser.student.currentSemester) : '',
      designation: profileUser.teacher?.designation || '',
      signatureData: profileUser.teacher?.signatureData || '',
    });
  }, [profileUser]);

  const updateProfileField = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = profileForm.name.trim();
    const email = profileForm.email.trim().toLowerCase();
    if (!name || !email) {
      toast.error('Name and email are required.');
      return;
    }

    const payload = {
      name,
      email,
      ...(profileUser?.role === Role.STUDENT
        ? {
            phoneNumber: profileForm.phoneNumber.trim() || undefined,
            department: profileForm.department || undefined,
            currentSemester: profileForm.currentSemester ? Number(profileForm.currentSemester) : undefined,
          }
        : {}),
      ...(profileUser?.role === Role.TEACHER
        ? {
            department: profileForm.department || undefined,
            designation: profileForm.designation.trim() || undefined,
            signatureData: profileForm.signatureData.trim() || undefined,
          }
        : {}),
    };

    try {
      await updateProfile(payload).unwrap();
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update profile.'));
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to change password.'));
    }
  };

  if (isLoading && !profileUser) {
    return <LoadingState message="Loading profile..." />;
  }

  if (!profileUser) {
    return <ErrorState message="Failed to load profile." onRetry={refetch} />;
  }

  const profileRows = [
    ['Name', profileUser.name || '-'],
    ['Email', profileUser.email],
    ['Role', profileUser.role],
    ['Status', profileUser.isActive === false ? 'Inactive' : 'Active'],
  ];

  if (profileUser.student) {
    profileRows.push(['Registration Number', profileUser.student.studentRegNumber || '-']);
    profileRows.push(['Phone Number', profileUser.student.phoneNumber || '-']);
    profileRows.push(['Department', profileUser.student.department || '-']);
    profileRows.push(['Current Semester', profileUser.student.currentSemester ? String(profileUser.student.currentSemester) : '-']);
  }

  if (profileUser.teacher) {
    profileRows.push(['Teacher ID', profileUser.teacher.teacherId || '-']);
    profileRows.push(['Department', profileUser.teacher.department || '-']);
    profileRows.push(['Designation', profileUser.teacher.designation || '-']);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Profile</h1>
        <p className="text-sm text-warm-taupe">Your authenticated library account information.</p>
      </div>

      {isError ? (
        <div className="border-2 border-library-ink bg-library-mist px-4 py-3 text-sm font-semibold text-library-ink shadow-[3px_3px_0_#1a1c1a]">
          Live profile refresh failed, so the saved signed-in profile is shown. Use Retry to refresh from the server.
          <button type="button" className="ml-2 font-semibold underline" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : null}

      <Card>
        <dl className="grid gap-4 md:grid-cols-2">
          {profileRows.map(([label, value]) => (
            <div key={label} className="border-2 border-library-ink bg-pale-cream p-4 shadow-[3px_3px_0_#1a1c1a]">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-warm-taupe">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-library-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-library-ink">Edit Profile</h2>
            <p className="mt-1 text-sm text-warm-taupe">Update your contact and role-specific profile details.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-warm-taupe">
              Name
              <Input
                value={profileForm.name}
                onChange={(event) => updateProfileField('name', event.target.value)}
                required
                disabled={isUpdatingProfile}
              />
            </label>
            <label className="text-sm font-semibold text-warm-taupe">
              Email
              <Input
                type="email"
                value={profileForm.email}
                onChange={(event) => updateProfileField('email', event.target.value)}
                required
                disabled={isUpdatingProfile}
              />
            </label>

            {profileUser.role === Role.STUDENT ? (
              <>
                <label className="text-sm font-semibold text-warm-taupe">
                  Phone Number
                  <Input
                    value={profileForm.phoneNumber}
                    onChange={(event) => updateProfileField('phoneNumber', event.target.value)}
                    disabled={isUpdatingProfile}
                  />
                </label>
                <label className="text-sm font-semibold text-warm-taupe">
                  Department
                  <select
                    value={profileForm.department}
                    onChange={(event) => updateProfileField('department', event.target.value)}
                    className="mt-1 block min-h-10 w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink shadow-[2px_2px_0_#1a1c1a]"
                    disabled={isUpdatingProfile}
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-warm-taupe">
                  Current Semester
                  <Input
                    type="number"
                    min={1}
                    value={profileForm.currentSemester}
                    onChange={(event) => updateProfileField('currentSemester', event.target.value)}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </>
            ) : null}

            {profileUser.role === Role.TEACHER ? (
              <>
                <label className="text-sm font-semibold text-warm-taupe">
                  Department
                  <select
                    value={profileForm.department}
                    onChange={(event) => updateProfileField('department', event.target.value)}
                    className="mt-1 block min-h-10 w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink shadow-[2px_2px_0_#1a1c1a]"
                    disabled={isUpdatingProfile}
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-warm-taupe">
                  Designation
                  <Input
                    value={profileForm.designation}
                    onChange={(event) => updateProfileField('designation', event.target.value)}
                    disabled={isUpdatingProfile}
                  />
                </label>
                <label className="text-sm font-semibold text-warm-taupe md:col-span-2">
                  Signature
                  <textarea
                    value={profileForm.signatureData}
                    onChange={(event) => updateProfileField('signatureData', event.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-2 border-library-ink bg-paper-soft px-3 py-2 text-sm font-semibold text-library-ink shadow-[2px_2px_0_#1a1c1a]"
                    disabled={isUpdatingProfile}
                  />
                </label>
              </>
            ) : null}
          </div>

          <Button type="submit" disabled={isUpdatingProfile}>
            {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>

      <Card>
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-library-ink">Change Password</h2>
            <p className="mt-1 text-sm text-warm-taupe">Enter your current password before setting a new one.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-warm-taupe">
              Current Password
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
                required
                disabled={isChangingPassword}
              />
            </label>
            <label className="text-sm font-semibold text-warm-taupe">
              New Password
              <Input
                type="password"
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(event) => updatePasswordField('newPassword', event.target.value)}
                required
                disabled={isChangingPassword}
              />
            </label>
            <label className="text-sm font-semibold text-warm-taupe">
              Confirm New Password
              <Input
                type="password"
                minLength={8}
                value={passwordForm.confirmPassword}
                onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
                required
                disabled={isChangingPassword}
              />
            </label>
          </div>

          <Button type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;

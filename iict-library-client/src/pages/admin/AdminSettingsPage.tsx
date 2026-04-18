import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { useGetPoliciesQuery, useUpdatePoliciesMutation } from '../../services/library.api';

const AdminSettingsPage = () => {
  const { data, isLoading, isError, refetch } = useGetPoliciesQuery();
  const [updatePolicies, { isLoading: isSaving }] = useUpdatePoliciesMutation();

  const [form, setForm] = useState({
    studentBorrowDurationDays: 14,
    teacherBorrowDurationDays: 30,
    maxActiveLoansStudent: 3,
    maxActiveLoansTeacher: 5,
    finePerDay: 0,
    reservationExpiryHours: 48,
    outsideBookEnabled: true,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setForm({
      studentBorrowDurationDays: data.studentBorrowDurationDays,
      teacherBorrowDurationDays: data.teacherBorrowDurationDays,
      maxActiveLoansStudent: data.maxActiveLoansStudent,
      maxActiveLoansTeacher: data.maxActiveLoansTeacher,
      finePerDay: Number(data.finePerDay),
      reservationExpiryHours: data.reservationExpiryHours,
      outsideBookEnabled: data.outsideBookEnabled,
    });
  }, [data]);

  const handleSave = async () => {
    if (form.studentBorrowDurationDays < 1 || form.teacherBorrowDurationDays < 1) {
      toast.error('Borrowing duration must be at least 1 day');
      return;
    }

    try {
      await updatePolicies(form).unwrap();
      toast.success('Library settings updated');
    } catch {
      toast.error('Failed to update settings');
    }
  };

  const updateNumber = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Library Policy and Settings</h1>
      <Card className="space-y-5">
        {isLoading && <LoadingState message="Loading policy settings..." />}
        {isError && <ErrorState message="Failed to load settings." onRetry={refetch} />}

        {!isLoading && !isError && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-warm-taupe">Student Borrow Duration (days)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.studentBorrowDurationDays}
                  onChange={(e) => updateNumber('studentBorrowDurationDays', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Teacher Borrow Duration (days)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.teacherBorrowDurationDays}
                  onChange={(e) => updateNumber('teacherBorrowDurationDays', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Max Active Loans (Student)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxActiveLoansStudent}
                  onChange={(e) => updateNumber('maxActiveLoansStudent', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Max Active Loans (Teacher)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxActiveLoansTeacher}
                  onChange={(e) => updateNumber('maxActiveLoansTeacher', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Fine Per Day</label>
                <Input
                  type="number"
                  min={0}
                  value={form.finePerDay}
                  onChange={(e) => updateNumber('finePerDay', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Reservation Expiry (hours)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.reservationExpiryHours}
                  onChange={(e) => updateNumber('reservationExpiryHours', e.target.value)}
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-dark-brown">
              <input
                type="checkbox"
                checked={form.outsideBookEnabled}
                onChange={(e) => setForm((prev) => ({ ...prev, outsideBookEnabled: e.target.checked }))}
              />
              Enable outside-book entry module
            </label>

            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminSettingsPage;

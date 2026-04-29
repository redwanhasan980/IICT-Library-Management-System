import { Card } from '../components/shared/Card';
import { LoadingState, ErrorState } from '../components/shared/FeedbackState';
import { useGetMeQuery } from '../services/auth.api';

const ProfilePage = () => {
  const { data: user, isLoading, isError, refetch } = useGetMeQuery();

  if (isLoading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (isError || !user) {
    return <ErrorState message="Failed to load profile." onRetry={refetch} />;
  }

  const profileRows = [
    ['Name', user.name || '-'],
    ['Email', user.email],
    ['Role', user.role],
    ['Status', user.isActive === false ? 'Inactive' : 'Active'],
  ];

  if (user.student) {
    profileRows.push(['Registration Number', user.student.studentRegNumber || '-']);
    profileRows.push(['Phone Number', user.student.phoneNumber || '-']);
    profileRows.push(['Department', user.student.department || '-']);
    profileRows.push(['Current Semester', user.student.currentSemester ? String(user.student.currentSemester) : '-']);
  }

  if (user.teacher) {
    profileRows.push(['Teacher ID', user.teacher.teacherId || '-']);
    profileRows.push(['Department', user.teacher.department || '-']);
    profileRows.push(['Designation', user.teacher.designation || '-']);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-brown">Profile</h1>
        <p className="text-sm text-warm-taupe">Your authenticated library account information.</p>
      </div>

      <Card>
        <dl className="grid gap-4 md:grid-cols-2">
          {profileRows.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-sandy-beige/70 bg-pale-cream/40 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-warm-taupe">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-library-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
};

export default ProfilePage;

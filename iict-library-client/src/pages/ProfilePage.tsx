import { Card } from '../components/shared/Card';
import { LoadingState, ErrorState } from '../components/shared/FeedbackState';
import { useGetMeQuery } from '../services/auth.api';
import { selectCurrentUser } from '../services/auth.slice';
import { useAppSelector } from '../store';

const ProfilePage = () => {
  const cachedUser = useAppSelector(selectCurrentUser);
  const { data: user, isLoading, isError, refetch } = useGetMeQuery();
  const profileUser = user ?? cachedUser;

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
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live profile refresh failed, so the saved signed-in profile is shown. Use Retry to refresh from the server.
          <button type="button" className="ml-2 font-semibold underline" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : null}

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

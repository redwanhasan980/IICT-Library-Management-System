import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Badge } from '../../components/shared/Badge';
import { Button } from '../../components/shared/Button';
import { Card } from '../../components/shared/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/shared/FeedbackState';
import { Input } from '../../components/shared/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/shared/Table';
import { useCreateUserMutation, useListUsersQuery, useSetUserActiveStatusMutation } from '../../services/user.api';
import type { Role, User } from '../../types/user.types';
import { getApiErrorMessage } from '../../utils/apiError';

const AdminUsersPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as Role,
    studentRegNumber: '',
    phoneNumber: '',
    teacherId: '',
    department: 'SWE' as 'CSE' | 'SWE' | 'EEE',
    currentSemester: '',
    designation: '',
    signatureData: '',
  });

  const { data, isLoading, isError, refetch } = useListUsersQuery({
    q: search || undefined,
    role: roleFilter || undefined,
    page,
    pageSize,
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [setStatus, { isLoading: isSettingStatus }] = useSetUserActiveStatusMutation();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      studentRegNumber: '',
      phoneNumber: '',
      teacherId: '',
      department: 'SWE',
      currentSemester: '',
      designation: '',
      signatureData: '',
    });
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        department: formData.role === 'ADMIN' ? undefined : formData.department,
        studentRegNumber: formData.role === 'STUDENT' ? formData.studentRegNumber.trim() : undefined,
        phoneNumber: formData.role === 'STUDENT' ? formData.phoneNumber.trim() : undefined,
        currentSemester: formData.role === 'STUDENT' && formData.currentSemester ? Number(formData.currentSemester) : undefined,
        teacherId: formData.role === 'TEACHER' ? formData.teacherId.trim() : undefined,
        designation: formData.role === 'TEACHER' ? formData.designation.trim() || undefined : undefined,
        signatureData: formData.role === 'TEACHER' ? formData.signatureData.trim() || undefined : undefined,
      }).unwrap();
      toast.success('Member created');
      resetForm();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to create member'));
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const memberIdentifier = (user: User) => {
    if (user.role === 'STUDENT') {
      return user.student?.studentRegNumber || '-';
    }
    if (user.role === 'TEACHER') {
      return user.teacher?.teacherId || '-';
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-brown">Members</h1>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-brown">Create Member</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-warm-taupe">Name</label>
              <Input value={formData.name} onChange={(e) => updateField('name', e.target.value)} required disabled={isCreating} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Email</label>
              <Input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} required disabled={isCreating} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Password</label>
              <Input type="password" minLength={8} value={formData.password} onChange={(e) => updateField('password', e.target.value)} required disabled={isCreating} />
            </div>
            <div>
              <label className="text-sm text-warm-taupe">Role</label>
              <select
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
                disabled={isCreating}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {formData.role !== 'ADMIN' && (
              <div>
                <label className="text-sm text-warm-taupe">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
                  disabled={isCreating}
                >
                  <option value="CSE">CSE</option>
                  <option value="SWE">SWE</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>
            )}
            {formData.role === 'STUDENT' && (
              <>
                <div>
                  <label className="text-sm text-warm-taupe">Student Reg Number</label>
                  <Input value={formData.studentRegNumber} onChange={(e) => updateField('studentRegNumber', e.target.value)} required disabled={isCreating} />
                </div>
                <div>
                  <label className="text-sm text-warm-taupe">Phone Number</label>
                  <Input value={formData.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} required disabled={isCreating} />
                </div>
                <div>
                  <label className="text-sm text-warm-taupe">Current Semester</label>
                  <Input type="number" min={1} value={formData.currentSemester} onChange={(e) => updateField('currentSemester', e.target.value)} disabled={isCreating} />
                </div>
              </>
            )}
            {formData.role === 'TEACHER' && (
              <>
                <div>
                  <label className="text-sm text-warm-taupe">Teacher ID</label>
                  <Input value={formData.teacherId} onChange={(e) => updateField('teacherId', e.target.value)} required disabled={isCreating} />
                </div>
                <div>
                  <label className="text-sm text-warm-taupe">Designation</label>
                  <Input value={formData.designation} onChange={(e) => updateField('designation', e.target.value)} disabled={isCreating} />
                </div>
                <div>
                  <label className="text-sm text-warm-taupe">Signature Text</label>
                  <Input value={formData.signatureData} onChange={(e) => updateField('signatureData', e.target.value)} disabled={isCreating} />
                </div>
              </>
            )}
          </div>
          <Button type="submit" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create Member'}</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-lg font-semibold text-dark-brown">Member Directory</h2>
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-2">
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search members" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as Role | '');
                setPage(1);
              }}
              className="mt-1 rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
            >
              <option value="">All roles</option>
              <option value="STUDENT">Students</option>
              <option value="TEACHER">Teachers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </div>

        {isLoading && <LoadingState message="Loading members..." />}
        {isError && <ErrorState message="Failed to load members." onRetry={refetch} />}
        {!isLoading && !isError && data && data.items.length === 0 && <EmptyState message="No members found." />}
        {!isLoading && !isError && data && data.items.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{memberIdentifier(user)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive === false ? 'danger' : 'success'}>
                        {user.isActive === false ? 'Inactive' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isSettingStatus}
                        onClick={async () => {
                          try {
                            await setStatus({ id: user.id, isActive: user.isActive === false }).unwrap();
                          } catch (error: unknown) {
                            toast.error(getApiErrorMessage(error, 'Failed to update member status'));
                          }
                        }}
                      >
                        {user.isActive === false ? 'Activate' : 'Deactivate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-sandy-beige/70 pt-4">
                <span className="text-sm text-warm-taupe">Page {data.page} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" disabled={data.page === 1} onClick={() => setPage((prev) => prev - 1)}>Prev</Button>
                  <Button size="sm" variant="ghost" disabled={data.page === data.totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminUsersPage;

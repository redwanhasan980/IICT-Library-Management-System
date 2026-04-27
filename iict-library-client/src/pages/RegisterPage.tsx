import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { useRegisterMutation } from '../services/auth.api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentRegNumber: '',
    teacherId: '',
    department: 'SWE' as 'CSE' | 'SWE' | 'EEE',
    currentSemester: '',
    designation: '',
    signatureData: '',
  });
  const [registerAccount, { isLoading }] = useRegisterMutation();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await registerAccount({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role,
        department: formData.department,
        studentRegNumber: role === 'STUDENT' ? formData.studentRegNumber.trim() : undefined,
        currentSemester: role === 'STUDENT' && formData.currentSemester ? Number(formData.currentSemester) : undefined,
        teacherId: role === 'TEACHER' ? formData.teacherId.trim() : undefined,
        designation: role === 'TEACHER' ? formData.designation.trim() || undefined : undefined,
        signatureData: role === 'TEACHER' ? formData.signatureData.trim() || undefined : undefined,
      }).unwrap();
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Registration failed');
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold text-dark-brown">Register</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-warm-taupe">Name</label>
            <Input value={formData.name} onChange={(e) => updateField('name', e.target.value)} required disabled={isLoading} />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Email</label>
            <Input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} required disabled={isLoading} />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Password</label>
            <Input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} required minLength={8} disabled={isLoading} />
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'STUDENT' | 'TEACHER')}
              className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              disabled={isLoading}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-warm-taupe">Department</label>
            <select
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              disabled={isLoading}
            >
              <option value="CSE">CSE</option>
              <option value="SWE">SWE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
          {role === 'STUDENT' ? (
            <>
              <div>
                <label className="text-sm text-warm-taupe">Student Reg Number</label>
                <Input value={formData.studentRegNumber} onChange={(e) => updateField('studentRegNumber', e.target.value)} required disabled={isLoading} />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Current Semester</label>
                <Input type="number" min={1} value={formData.currentSemester} onChange={(e) => updateField('currentSemester', e.target.value)} disabled={isLoading} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm text-warm-taupe">Teacher ID</label>
                <Input value={formData.teacherId} onChange={(e) => updateField('teacherId', e.target.value)} required disabled={isLoading} />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Designation</label>
                <Input value={formData.designation} onChange={(e) => updateField('designation', e.target.value)} disabled={isLoading} />
              </div>
              <div>
                <label className="text-sm text-warm-taupe">Signature Text</label>
                <Input value={formData.signatureData} onChange={(e) => updateField('signatureData', e.target.value)} disabled={isLoading} />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RegisterPage;

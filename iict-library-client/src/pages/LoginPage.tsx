import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { useAppDispatch } from '../store';
import { setCredentials } from '../services/auth.slice';
import { Role } from '../types/user.types';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return;
    }

    dispatch(
      setCredentials({
        user: {
          id: normalizedEmail,
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role,
        },
        token: 'dev-session-token',
      })
    );

    navigate('/dashboard');
  };

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold text-dark-brown">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm text-warm-taupe">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-warm-taupe">Password</label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div>
          <label htmlFor="role" className="text-sm text-warm-taupe">Role</label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="mt-1 w-full rounded-md border border-sandy-beige px-3 py-2 text-sm text-dark-brown focus:border-dark-brown focus:outline-none focus:ring-1 focus:ring-dark-brown"
          >
            <option value={Role.STUDENT}>Student</option>
            <option value={Role.ADMIN}>Admin</option>
            <option value={Role.TEACHER}>Teacher</option>
          </select>
        </div>

        <p className="text-xs text-warm-taupe">
          Temporary development login. Role and email are used to attach API auth headers.
        </p>

        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </Card>
  );
};

export default LoginPage;

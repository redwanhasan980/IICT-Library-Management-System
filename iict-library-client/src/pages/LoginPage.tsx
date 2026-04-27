import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { useLoginMutation } from '../services/auth.api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || isLoading) {
      return;
    }

    try {
      await login({ email: normalizedEmail, password }).unwrap();
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Login failed');
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold text-dark-brown">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm text-warm-taupe">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-warm-taupe">Password</label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
};

export default LoginPage;

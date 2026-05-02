import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import { useLoginMutation } from '../services/auth.api';
import { getApiErrorMessage } from '../utils/apiError';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || isLoading) {
      return;
    }

    setFormError('');
    try {
      await login({ email: normalizedEmail, password }).unwrap();
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Login failed');
      setFormError(message);
      toast.error(message);
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
        {formError && (
          <p role="alert" className="border-2 border-rose-950 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-warm-taupe">
        <span>New here? </span>
        <Link to="/register" className="font-semibold text-library-forest hover:text-library-gold">
          Create an account
        </Link>
      </div>
    </Card>
  );
};

export default LoginPage;

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
          <label htmlFor="email" className="text-sm text-warm-taupe">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm text-warm-taupe">
            Password
          </label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
              className="pr-12"
            />

            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-warm-taupe hover:text-dark-brown disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c1.605 0 3.127-.36 4.487-1.005M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="border-2 border-rose-950 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800"
          >
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-4 space-y-3 text-center text-sm text-warm-taupe">
        <button
          type="button"
          className="inline-flex bg-paper-soft px-3 py-1.5 text-sm font-extrabold uppercase tracking-[0.08em] text-library-ink hover:bg-library-mist"
          aria-expanded={showPasswordHelp}
          onClick={() => setShowPasswordHelp((visible) => !visible)}
        >
          Forgot password?
        </button>

        {showPasswordHelp ? (
          <p className="border-2 border-library-ink bg-paper-muted px-3 py-2 text-left text-sm font-semibold text-library-ink shadow-[3px_3px_0_#1a1c1a]">
            Please contact the IICT Library office to reset your password or recover account access.
          </p>
        ) : null}

        {/* Institution-only deployment: /register remains available, but this UI link is intentionally hidden.
        <div>
          <span>New here? </span>
          <Link to="/register" className="font-semibold text-library-forest hover:text-library-gold">
            Create an account
          </Link>
        </div>
        */}
      </div>
    </Card>
  );
};

export default LoginPage;
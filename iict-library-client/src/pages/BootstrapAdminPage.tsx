import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { useBootstrapAdminMutation } from '../services/auth.api';
import { getApiErrorMessage } from '../utils/apiError';

const BootstrapAdminPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    setupToken: '',
    name: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [bootstrapAdmin, { isLoading }] = useBootstrapAdminMutation();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    try {
      await bootstrapAdmin({
        setupToken: formData.setupToken.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }).unwrap();
      toast.success('Admin account created');
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Admin bootstrap failed');
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold text-dark-brown">Bootstrap Admin</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-warm-taupe">Setup Token</label>
          <Input value={formData.setupToken} onChange={(e) => updateField('setupToken', e.target.value)} required disabled={isLoading} />
        </div>
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
          <Input type="password" minLength={8} value={formData.password} onChange={(e) => updateField('password', e.target.value)} required disabled={isLoading} />
        </div>
        {formError && (
          <p role="alert" className="border-2 border-rose-950 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating admin...' : 'Create first admin'}
        </Button>
      </form>
    </Card>
  );
};

export default BootstrapAdminPage;

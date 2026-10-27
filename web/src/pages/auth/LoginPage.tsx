import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { homePathFor, useAuth } from '../../auth/auth-context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { PasswordField, TextField } from '../../components/ui/Field.tsx';
import { toApiError } from '../../lib/api.ts';
import { safeNextPath } from '../../lib/navigation.ts';
import { AuthCard, FormError } from './AuthCard.tsx';

// DESIGN.md §1: pesan login generik, tidak membedakan email tidak terdaftar dan password salah.
const GENERIC_LOGIN_ERROR = 'Email atau password salah.';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      navigate(safeNextPath(params.get('next')) ?? homePathFor(user.role), { replace: true });
    } catch (caught) {
      const apiError = toApiError(caught);
      setError([401, 404].includes(apiError.status) ? GENERIC_LOGIN_ERROR : apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Masuk"
      subtitle="Masuk untuk memesan lapangan dan melihat riwayat booking Anda."
      footer={
        <>
          Belum punya akun?{' '}
          <Link to="/daftar" className="font-medium text-navy-900 underline underline-offset-4">
            Daftar sekarang
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Masuk
        </Button>
      </form>
    </AuthCard>
  );
}

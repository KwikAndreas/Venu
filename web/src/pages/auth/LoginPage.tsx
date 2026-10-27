import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { homePathFor, useAuth } from '../../auth/auth-context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { PasswordField, TextField } from '../../components/ui/Field.tsx';
import { toApiError, type ApiError } from '../../lib/api.ts';
import { safeNextPath } from '../../lib/navigation.ts';
import { IS_BEFORE_MODE } from '../../lib/security-mode.ts';
import { AuthCard, FormError } from './AuthCard.tsx';

const GENERIC_LOGIN_ERROR = 'Email atau password salah.';

function loginErrorMessage(error: ApiError): string {
  const isCredentialError = error.status === 401 || error.status === 404;
  if (!isCredentialError) return error.message;
  // [VULN-A07] Mode before: pesan asli dari API ditampilkan apa adanya, termasuk
  // "Email tidak terdaftar", sehingga keberadaan email terlihat dari UI.
  if (IS_BEFORE_MODE) return error.message;
  // [FIXED-A07] DESIGN.md §1: pesan generik, tidak membedakan email dan password.
  return GENERIC_LOGIN_ERROR;
}

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
      setError(loginErrorMessage(toApiError(caught)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Masuk"
      subtitle="Masuk untuk memesan lapangan dan melihat bookingmu."
      footer={
        <>
          Belum punya akun?{' '}
          <Link to="/daftar" className="font-medium text-fg underline underline-offset-4">
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

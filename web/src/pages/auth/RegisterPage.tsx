import { Building2, CalendarCheck, type LucideIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { homePathFor, useAuth, type RegisterInput } from '../../auth/auth-context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { PasswordField, TextField } from '../../components/ui/Field.tsx';
import { toApiError } from '../../lib/api.ts';
import { AuthCard, FormError } from './AuthCard.tsx';

type RoleOption = {
  value: RegisterInput['role'];
  title: string;
  description: string;
  icon: LucideIcon;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'penyewa',
    title: 'Penyewa',
    description: 'Saya ingin memesan lapangan',
    icon: CalendarCheck,
  },
  {
    value: 'pemilik',
    title: 'Pemilik',
    description: 'Saya ingin menyewakan lapangan',
    icon: Building2,
  },
];

export function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>({
    nama: '',
    email: '',
    password: '',
    role: 'penyewa',
  });
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      const input = { ...form, nama: form.nama.trim(), email: form.email.trim().toLowerCase() };
      await register(input);
      const user = await login(input.email, input.password);
      navigate(homePathFor(user.role), { replace: true });
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Buat akun"
      subtitle="Gabung dengan Venu untuk memesan atau menyewakan lapangan."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/masuk" className="font-medium text-fg underline underline-offset-4">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormError message={error} />

        <fieldset>
          <legend className="type-label mb-2 text-muted">Daftar sebagai</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(({ value, title, description, icon: Icon }) => {
              const selected = form.role === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                    selected
                      ? 'border-accent bg-accent-soft'
                      : 'border-line bg-raised hover:border-fg'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={selected}
                    onChange={() => update('role', value)}
                    className="sr-only"
                  />
                  <Icon className="size-5 text-fg" aria-hidden />
                  <span className="text-sm font-semibold text-fg">{title}</span>
                  <span className="text-xs text-muted">{description}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <TextField
          label="Nama lengkap"
          autoComplete="name"
          required
          value={form.nama}
          onChange={(event) => update('nama', event.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={(event) => update('password', event.target.value)}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Daftar
        </Button>
      </form>
    </AuthCard>
  );
}

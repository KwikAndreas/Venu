import { KeyRound, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/auth-context.ts';
import { useToast } from '../components/toast/toast-context.ts';
import { Button } from '../components/ui/Button.tsx';
import { PasswordField, TextField } from '../components/ui/Field.tsx';
import { Card, Container, PageHeader } from '../components/ui/Layout.tsx';
import { FormError } from './auth/AuthCard.tsx';
import { api, toApiError } from '../lib/api.ts';
import { ROLE_LABELS, formatDateTime } from '../lib/format.ts';
import type { User } from '../lib/types.ts';

function ProfileForm({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [nama, setNama] = useState(user.nama);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSaving(true);
    try {
      const result = await api.patch<{ user: User }>('/me', {
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
      });
      updateUser(result.user);
      showToast('Profil diperbarui.', 'success');
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-gold-100">
            <UserRound className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="type-h3 text-navy-900">Data profil</h2>
            <p className="text-sm text-muted">
              {ROLE_LABELS[user.role]} · bergabung {formatDateTime(user.created_at)}
            </p>
          </div>
        </div>
        <FormError message={error} />
        <TextField
          label="Nama lengkap"
          required
          value={nama}
          onChange={(event) => setNama(event.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" loading={saving}>
          Simpan Perubahan
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
  const { showToast } = useToast();
  const [lama, setLama] = useState('');
  const [baru, setBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    if (baru !== konfirmasi) {
      setError('Konfirmasi password baru tidak sama.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/me/password', { password_lama: lama, password_baru: baru });
      setLama('');
      setBaru('');
      setKonfirmasi('');
      showToast('Password berhasil diganti.', 'success');
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-gold-100">
            <KeyRound className="size-5" aria-hidden />
          </div>
          <h2 className="type-h3 text-navy-900">Ganti password</h2>
        </div>
        <FormError message={error} />
        <PasswordField
          label="Password lama"
          autoComplete="current-password"
          required
          value={lama}
          onChange={(event) => setLama(event.target.value)}
        />
        <PasswordField
          label="Password baru"
          autoComplete="new-password"
          required
          value={baru}
          onChange={(event) => setBaru(event.target.value)}
        />
        <PasswordField
          label="Ulangi password baru"
          autoComplete="new-password"
          required
          value={konfirmasi}
          onChange={(event) => setKonfirmasi(event.target.value)}
        />
        <Button type="submit" variant="secondary" loading={saving}>
          Ganti Password
        </Button>
      </form>
    </Card>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Container className="py-10">
      <PageHeader eyebrow="Akun saya" title="Profil" />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        {/* key: isi ulang form bila data user berubah dari tempat lain */}
        <ProfileForm key={`${user.nama}|${user.email}`} user={user} />
        <PasswordForm />
      </div>
    </Container>
  );
}

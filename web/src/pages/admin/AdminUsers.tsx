import { Search, Trash2, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/auth-context.ts';
import { useToast } from '../../components/toast/toast-context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { SelectField, TextField } from '../../components/ui/Field.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { inputClasses } from '../../components/ui/styles.ts';
import { IconAction, Table, Td, Th, Tr } from '../../components/ui/Table.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { api, toApiError } from '../../lib/api.ts';
import { ROLE_LABELS, formatDateTime } from '../../lib/format.ts';
import type { Role, User } from '../../lib/types.ts';

const ROLES = Object.keys(ROLE_LABELS) as Role[];

type PendingChange = { kind: 'role'; user: User; role: Role } | { kind: 'delete'; user: User };

export function AdminUsers({ onChanged }: { onChanged: () => void }) {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState({ q: '', role: '' });
  const [draft, setDraft] = useState(filter);
  const query = new URLSearchParams(Object.entries(filter).filter(([, value]) => value)).toString();
  const { data, error, reload } = useApi<{ users: User[] }>(`/admin/users?${query}`);
  const [pending, setPending] = useState<PendingChange>();
  const [processing, setProcessing] = useState(false);

  const applyFilter = (event: FormEvent) => {
    event.preventDefault();
    setFilter(draft);
  };

  const runChange = async () => {
    if (!pending) return;
    setProcessing(true);
    try {
      if (pending.kind === 'role') {
        await api.patch(`/admin/users/${pending.user.id}/role`, { role: pending.role });
        showToast(
          `Peran ${pending.user.nama} diubah menjadi ${ROLE_LABELS[pending.role]}.`,
          'success',
        );
      } else {
        await api.delete(`/admin/users/${pending.user.id}`);
        showToast(`${pending.user.nama} dihapus.`, 'success');
      }
      setPending(undefined);
      reload();
      onChanged();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={applyFilter}
        className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end"
      >
        <TextField
          label="Cari nama atau email"
          value={draft.q}
          onChange={(e) => setDraft({ ...draft, q: e.target.value })}
        />
        <SelectField
          label="Peran"
          value={draft.role}
          onChange={(e) => setDraft({ ...draft, role: e.target.value })}
        >
          <option value="">Semua peran</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </SelectField>
        <Button type="submit" variant="secondary">
          <Search className="size-4" aria-hidden />
          Cari
        </Button>
      </form>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-64" />
      ) : data.users.length === 0 ? (
        <EmptyState icon={Users} title="Pengguna tidak ditemukan" />
      ) : (
        <Table label="Daftar pengguna">
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Peran</Th>
              <Th>Bergabung</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => {
              const isMe = user.id === me?.id;
              return (
                <Tr key={user.id}>
                  <Td className="font-medium">
                    {user.nama} {isMe && <span className="text-muted">(kamu)</span>}
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <select
                      aria-label={`Peran ${user.nama}`}
                      value={user.role}
                      disabled={isMe}
                      onChange={(e) =>
                        setPending({ kind: 'role', user, role: e.target.value as Role })
                      }
                      className={inputClasses(false, 'h-10 w-36')}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </Td>
                  <Td className="text-muted">{formatDateTime(user.created_at)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <IconAction
                        icon={Trash2}
                        label={`Hapus ${user.nama}`}
                        tone="danger"
                        disabled={isMe}
                        onClick={() => setPending({ kind: 'delete', user })}
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        open={pending?.kind === 'role'}
        title="Ubah peran pengguna?"
        message={
          pending?.kind === 'role' &&
          `${pending.user.nama} akan menjadi ${ROLE_LABELS[pending.role]}. Hak aksesnya ikut berubah.`
        }
        confirmLabel="Ubah peran"
        destructive={false}
        loading={processing}
        onConfirm={runChange}
        onCancel={() => setPending(undefined)}
      />
      <ConfirmDialog
        open={pending?.kind === 'delete'}
        title="Hapus pengguna?"
        message={
          pending &&
          `${pending.user.nama} (${pending.user.email}) beserta lapangan, booking, dan ulasannya akan dihapus permanen.`
        }
        confirmLabel="Hapus pengguna"
        loading={processing}
        onConfirm={runChange}
        onCancel={() => setPending(undefined)}
      />
    </div>
  );
}

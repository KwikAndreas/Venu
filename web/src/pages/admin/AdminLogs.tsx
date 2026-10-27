import { CircleAlert, ScrollText } from 'lucide-react';
import { useState } from 'react';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { SelectField } from '../../components/ui/Field.tsx';
import { Table, Td, Th, Tr } from '../../components/ui/Table.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { formatDateTime } from '../../lib/format.ts';
import type { AuditLog } from '../../lib/types.ts';

const ACTION_LABELS: Record<string, string> = {
  'auth.register': 'Registrasi',
  'auth.login_berhasil': 'Login berhasil',
  'auth.login_gagal': 'Login gagal',
  'alert.login_gagal_beruntun': 'ALERT: login gagal beruntun',
  'user.ubah_profil': 'Ubah profil',
  'user.ubah_password': 'Ganti password',
  'booking.dikonfirmasi': 'Booking dikonfirmasi',
  'booking.ditolak': 'Booking ditolak',
  'admin.ubah_role': 'Admin: ubah peran',
  'admin.hapus_user': 'Admin: hapus pengguna',
  'admin.hapus_lapangan': 'Admin: hapus lapangan',
  'admin.hapus_ulasan': 'Admin: hapus ulasan',
};

const LOG_LIMIT = 200;

function isWarning(aksi: string): boolean {
  return aksi.startsWith('alert.') || aksi === 'auth.login_gagal';
}

export function AdminLogs() {
  const [aksi, setAksi] = useState('');
  const query = new URLSearchParams({ limit: String(LOG_LIMIT), ...(aksi ? { aksi } : {}) });
  const { data, error, reload } = useApi<{ logs: AuditLog[] }>(`/admin/audit-logs?${query}`);

  return (
    <div className="space-y-4">
      <SelectField
        label="Jenis aktivitas"
        className="sm:w-80"
        value={aksi}
        onChange={(e) => setAksi(e.target.value)}
      >
        <option value="">Semua aktivitas</option>
        {Object.entries(ACTION_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-64" />
      ) : data.logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="Belum ada aktivitas" />
      ) : (
        <Table label="Log aktivitas">
          <thead>
            <tr>
              <Th>Waktu</Th>
              <Th>Aktivitas</Th>
              <Th>Pengguna</Th>
              <Th>IP</Th>
              <Th>Detail</Th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((log) => (
              <Tr key={log.id}>
                <Td className="whitespace-nowrap text-muted">{formatDateTime(log.created_at)}</Td>
                <Td>
                  <span
                    className={`inline-flex items-center gap-1.5 font-medium ${isWarning(log.aksi) ? 'text-danger' : ''}`}
                  >
                    {isWarning(log.aksi) && <CircleAlert className="size-4" aria-hidden />}
                    {ACTION_LABELS[log.aksi] ?? log.aksi}
                  </span>
                </Td>
                <Td>{log.user_email ?? <span className="text-muted">—</span>}</Td>
                <Td className="font-mono text-xs">{log.ip ?? '—'}</Td>
                <Td className="max-w-xs break-words font-mono text-xs text-muted">
                  {log.detail ? JSON.stringify(log.detail) : '—'}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

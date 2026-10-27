import { Building2, ScrollText, Users } from 'lucide-react';
import { useState } from 'react';
import { ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { Container, PageHeader, StatCard } from '../../components/ui/Layout.tsx';
import { Tabs, type TabItem } from '../../components/ui/Tabs.tsx';
import { useApi } from '../../hooks/useApi.ts';
import type { AdminSummary } from '../../lib/types.ts';
import { AdminLogs } from './AdminLogs.tsx';
import { AdminUsers } from './AdminUsers.tsx';
import { AdminVenues } from './AdminVenues.tsx';

type AdminTab = 'pengguna' | 'lapangan' | 'log';

const TABS: TabItem<AdminTab>[] = [
  { id: 'pengguna', label: 'Pengguna', icon: Users },
  { id: 'lapangan', label: 'Lapangan', icon: Building2 },
  { id: 'log', label: 'Log aktivitas', icon: ScrollText },
];

function SummaryCards({ summary }: { summary: AdminSummary }) {
  const totalUsers = summary.users.penyewa + summary.users.pemilik + summary.users.admin;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Pengguna"
        value={totalUsers}
        note={`${summary.users.penyewa} penyewa · ${summary.users.pemilik} pemilik · ${summary.users.admin} admin`}
      />
      <StatCard label="Lapangan" value={summary.jumlah_lapangan} />
      <StatCard
        highlight
        label="Booking"
        value={summary.jumlah_booking}
        note={`${summary.booking_menunggu} menunggu · ${summary.pembayaran_lunas} lunas`}
      />
      <StatCard label="Login gagal (24 jam)" value={summary.login_gagal_24_jam} />
    </div>
  );
}

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('pengguna');
  const summary = useApi<AdminSummary>('/admin/summary');

  return (
    <Container className="space-y-8 py-10">
      <PageHeader
        title="Panel Admin"
        description="Kelola pengguna dan lapangan, serta pantau aktivitas penting."
      />

      {summary.error ? (
        <ErrorState message={summary.error.message} onRetry={summary.reload} />
      ) : !summary.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : (
        <SummaryCards summary={summary.data} />
      )}

      <Tabs label="Bagian panel admin" items={TABS} active={tab} onChange={setTab} />
      <div role="tabpanel">
        {tab === 'pengguna' && <AdminUsers onChanged={summary.reload} />}
        {tab === 'lapangan' && <AdminVenues onChanged={summary.reload} />}
        {tab === 'log' && <AdminLogs />}
      </div>
    </Container>
  );
}

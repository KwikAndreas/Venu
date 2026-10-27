import { Building2, ChartColumn, Inbox } from 'lucide-react';
import { useState } from 'react';
import { Container, PageHeader } from '../../components/ui/Layout.tsx';
import { Tabs, type TabItem } from '../../components/ui/Tabs.tsx';
import { IncomingBookings } from './IncomingBookings.tsx';
import { OwnerOverview } from './OwnerOverview.tsx';
import { VenueManager } from './VenueManager.tsx';

type OwnerTab = 'ringkasan' | 'booking' | 'lapangan';

const TABS: TabItem<OwnerTab>[] = [
  { id: 'ringkasan', label: 'Ringkasan', icon: ChartColumn },
  { id: 'booking', label: 'Booking masuk', icon: Inbox },
  { id: 'lapangan', label: 'Lapangan saya', icon: Building2 },
];

export function OwnerDashboardPage() {
  const [tab, setTab] = useState<OwnerTab>('ringkasan');

  return (
    <Container className="space-y-8 py-10">
      <PageHeader
        title="Dashboard"
        description="Pantau performa lapangan, proses booking yang masuk, dan kelola data lapangan."
      />
      <Tabs label="Bagian dashboard" items={TABS} active={tab} onChange={setTab} />
      <div role="tabpanel">
        {tab === 'ringkasan' && <OwnerOverview />}
        {tab === 'booking' && <IncomingBookings />}
        {tab === 'lapangan' && <VenueManager />}
      </div>
    </Container>
  );
}

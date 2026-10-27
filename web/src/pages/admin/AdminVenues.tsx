import { Building2, Eye, Search, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '../../components/toast/toast-context.ts';
import { SportBadge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { TextField } from '../../components/ui/Field.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { IconAction, Table, Td, Th, Tr } from '../../components/ui/Table.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { api, toApiError } from '../../lib/api.ts';
import { formatRupiah } from '../../lib/format.ts';
import type { AdminVenue } from '../../lib/types.ts';

export function AdminVenues({ onChanged }: { onChanged: () => void }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState('');
  const { data, error, reload } = useApi<{ venues: AdminVenue[] }>(
    `/admin/venues${q ? `?q=${encodeURIComponent(q)}` : ''}`,
  );
  const [toDelete, setToDelete] = useState<AdminVenue>();
  const [deleting, setDeleting] = useState(false);

  const applySearch = (event: FormEvent) => {
    event.preventDefault();
    setQ(draft.trim());
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/venues/${toDelete.id}`);
      showToast(`${toDelete.nama} dihapus.`, 'success');
      setToDelete(undefined);
      reload();
      onChanged();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <TextField
          label="Cari nama lapangan atau kota"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          <Search className="size-4" aria-hidden />
          Cari
        </Button>
      </form>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-64" />
      ) : data.venues.length === 0 ? (
        <EmptyState icon={Building2} title="Lapangan tidak ditemukan" />
      ) : (
        <Table label="Semua lapangan">
          <thead>
            <tr>
              <Th>Lapangan</Th>
              <Th>Jenis</Th>
              <Th>Pemilik</Th>
              <Th className="text-right">Booking</Th>
              <Th className="text-right">Harga / jam</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {data.venues.map((venue) => (
              <Tr key={venue.id}>
                <Td>
                  <div className="font-medium">{venue.nama}</div>
                  <div className="text-muted">{venue.kota}</div>
                </Td>
                <Td>
                  <SportBadge sport={venue.jenis_olahraga} />
                </Td>
                <Td>
                  <div>{venue.nama_pemilik}</div>
                  <div className="text-muted">{venue.email_pemilik}</div>
                </Td>
                <Td className="text-right">{venue.jumlah_booking}</Td>
                <Td className="text-right font-semibold">{formatRupiah(venue.harga_per_jam)}</Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <IconAction
                      icon={Eye}
                      label={`Lihat ${venue.nama}`}
                      onClick={() => navigate(`/lapangan/${venue.id}`)}
                    />
                    <IconAction
                      icon={Trash2}
                      label={`Hapus ${venue.nama}`}
                      tone="danger"
                      onClick={() => setToDelete(venue)}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        open={toDelete !== undefined}
        title="Hapus lapangan?"
        message={
          toDelete &&
          `${toDelete.nama} milik ${toDelete.nama_pemilik} beserta ${toDelete.jumlah_booking} booking-nya akan dihapus permanen.`
        }
        confirmLabel="Hapus lapangan"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </div>
  );
}

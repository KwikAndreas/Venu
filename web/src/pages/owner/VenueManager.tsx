import { Building2, Eye, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '../../components/toast/toast-context.ts';
import { SportBadge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { IconAction, Table, Td, Th, Tr } from '../../components/ui/Table.tsx';
import { VenuePhoto } from '../../components/venue/VenuePhoto.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { api, toApiError } from '../../lib/api.ts';
import { MAX_UPLOAD_BYTES } from '../../lib/booking-rules.ts';
import { formatRupiah } from '../../lib/format.ts';
import type { Venue } from '../../lib/types.ts';
import { VenueFormModal } from './VenueFormModal.tsx';

type Editing = { venue?: Venue } | undefined;

export function VenueManager() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { data, error, reload } = useApi<{ venues: Venue[] }>('/venues/mine');
  const [editing, setEditing] = useState<Editing>();
  const [toDelete, setToDelete] = useState<Venue>();
  const [deleting, setDeleting] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoTarget = useRef<Venue | undefined>(undefined);

  const choosePhoto = (venue: Venue) => {
    photoTarget.current = venue;
    photoInput.current?.click();
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const venue = photoTarget.current;
    event.target.value = '';
    if (!file || !venue) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast('Ukuran foto maksimal 2 MB.', 'error');
      return;
    }
    const form = new FormData();
    form.set('foto', file);
    try {
      await api.upload(`/venues/${venue.id}/photo`, form);
      showToast(`Foto ${venue.nama} diperbarui.`, 'success');
      reload();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/venues/${toDelete.id}`);
      showToast(`${toDelete.nama} dihapus.`, 'success');
      setToDelete(undefined);
      reload();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = () => {
    showToast(editing?.venue ? 'Lapangan diperbarui.' : 'Lapangan ditambahkan.', 'success');
    setEditing(undefined);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({})}>
          <Plus className="size-4" aria-hidden />
          Tambah Lapangan
        </Button>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-64" />
      ) : data.venues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Belum ada lapangan"
          description="Tambahkan lapangan pertama Anda agar bisa dipesan penyewa."
        />
      ) : (
        <Table label="Lapangan saya">
          <thead>
            <tr>
              <Th className="w-28">Foto</Th>
              <Th>Lapangan</Th>
              <Th>Jenis</Th>
              <Th className="text-right">Harga / jam</Th>
              <Th>Jam operasional</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {data.venues.map((venue) => (
              <Tr key={venue.id}>
                <Td>
                  <VenuePhoto
                    fotoUrl={venue.foto_url}
                    nama={venue.nama}
                    sport={venue.jenis_olahraga}
                    className="w-24 rounded-sm [&_svg]:size-5 [&_span]:hidden"
                  />
                </Td>
                <Td>
                  <div className="font-medium">{venue.nama}</div>
                  <div className="text-muted">{venue.kota}</div>
                </Td>
                <Td>
                  <SportBadge sport={venue.jenis_olahraga} />
                </Td>
                <Td className="text-right font-semibold">{formatRupiah(venue.harga_per_jam)}</Td>
                <Td>
                  {venue.jam_buka}–{venue.jam_tutup}
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <IconAction
                      icon={Eye}
                      label={`Lihat halaman ${venue.nama}`}
                      onClick={() => navigate(`/lapangan/${venue.id}`)}
                    />
                    <IconAction
                      icon={ImagePlus}
                      label={`Ganti foto ${venue.nama}`}
                      onClick={() => choosePhoto(venue)}
                    />
                    <IconAction
                      icon={Pencil}
                      label={`Edit ${venue.nama}`}
                      onClick={() => setEditing({ venue })}
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

      <input
        ref={photoInput}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={uploadPhoto}
        aria-hidden
        tabIndex={-1}
      />

      {editing && (
        <VenueFormModal
          key={editing.venue?.id ?? 'baru'}
          open
          venue={editing.venue}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
        />
      )}
      <ConfirmDialog
        open={toDelete !== undefined}
        title="Hapus lapangan?"
        message={
          toDelete &&
          `${toDelete.nama} beserta seluruh booking dan ulasannya akan dihapus permanen.`
        }
        confirmLabel="Hapus lapangan"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </div>
  );
}

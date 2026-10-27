import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button.tsx';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { FormError } from '../auth/AuthCard.tsx';
import { api, toApiError } from '../../lib/api.ts';
import { SPORT_LABELS, SPORTS } from '../../lib/format.ts';
import type { Sport, Venue, VenueInput } from '../../lib/types.ts';

type FormState = {
  nama: string;
  jenis_olahraga: Sport;
  alamat: string;
  kota: string;
  harga_per_jam: string;
  jam_buka: string;
  jam_tutup: string;
  fasilitas: string;
  deskripsi: string;
};

const FORM_ID = 'form-lapangan';

function initialState(venue: Venue | undefined): FormState {
  return {
    nama: venue?.nama ?? '',
    jenis_olahraga: venue?.jenis_olahraga ?? 'futsal',
    alamat: venue?.alamat ?? '',
    kota: venue?.kota ?? '',
    harga_per_jam: venue ? String(venue.harga_per_jam) : '',
    jam_buka: venue?.jam_buka ?? '08:00',
    jam_tutup: venue?.jam_tutup ?? '22:00',
    fasilitas: venue?.fasilitas.join(', ') ?? '',
    deskripsi: venue?.deskripsi ?? '',
  };
}

function toPayload(form: FormState): VenueInput {
  return {
    nama: form.nama.trim(),
    jenis_olahraga: form.jenis_olahraga,
    alamat: form.alamat.trim(),
    kota: form.kota.trim(),
    harga_per_jam: Number(form.harga_per_jam),
    jam_buka: form.jam_buka,
    jam_tutup: form.jam_tutup,
    fasilitas: form.fasilitas
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    deskripsi: form.deskripsi.trim() || undefined,
  };
}

type VenueFormModalProps = {
  open: boolean;
  /** Kosong = tambah lapangan baru. */
  venue?: Venue;
  onClose: () => void;
  onSaved: () => void;
};

/** Dipasang dengan `key` per lapangan oleh induknya agar isi form selalu sesuai lapangan yang diedit. */
export function VenueFormModal({ open, venue, onClose, onSaved }: VenueFormModalProps) {
  const [form, setForm] = useState(() => initialState(venue));
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (venue) await api.patch(`/venues/${venue.id}`, payload);
      else await api.post('/venues', payload);
      onSaved();
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={venue ? 'Edit lapangan' : 'Tambah lapangan'}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {venue ? 'Simpan Perubahan' : 'Tambah Lapangan'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormError message={error} />
        </div>
        <TextField
          label="Nama lapangan"
          required
          className="sm:col-span-2"
          value={form.nama}
          onChange={(e) => update('nama', e.target.value)}
        />
        <SelectField
          label="Jenis olahraga"
          value={form.jenis_olahraga}
          onChange={(e) => update('jenis_olahraga', e.target.value as Sport)}
        >
          {SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {SPORT_LABELS[sport]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Harga per jam (Rp)"
          type="number"
          min={1}
          step={1000}
          inputMode="numeric"
          required
          value={form.harga_per_jam}
          onChange={(e) => update('harga_per_jam', e.target.value)}
        />
        <TextField
          label="Alamat"
          required
          className="sm:col-span-2"
          value={form.alamat}
          onChange={(e) => update('alamat', e.target.value)}
        />
        <TextField
          label="Kota"
          required
          value={form.kota}
          onChange={(e) => update('kota', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Jam buka"
            type="time"
            step={3600}
            required
            value={form.jam_buka}
            onChange={(e) => update('jam_buka', e.target.value)}
          />
          <TextField
            label="Jam tutup"
            type="time"
            step={3600}
            required
            value={form.jam_tutup}
            onChange={(e) => update('jam_tutup', e.target.value)}
          />
        </div>
        <TextField
          label="Fasilitas"
          className="sm:col-span-2"
          hint="Pisahkan dengan koma, contoh: Parkir, Ruang ganti, Kantin"
          value={form.fasilitas}
          onChange={(e) => update('fasilitas', e.target.value)}
        />
        <TextAreaField
          label="Deskripsi"
          className="sm:col-span-2"
          value={form.deskripsi}
          onChange={(e) => update('deskripsi', e.target.value)}
        />
      </form>
    </Modal>
  );
}

import type { Slot } from '../../lib/types.ts';

type SlotPickerProps = {
  slots: Slot[];
  selected: string[];
  onToggle: (slot: Slot) => void;
};

/**
 * Chip 44px per jam. Tersedia: putih bergaris. Dipilih: Navy, teks Ivory, garis emas.
 * Tidak tersedia: dicoret dan dinonaktifkan, jadi tidak hanya dibedakan lewat warna.
 */
export function SlotPicker({ slots, selected, onToggle }: SlotPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selected.includes(slot.jam_mulai);
        const label = `${slot.jam_mulai}–${slot.jam_selesai}`;
        let classes = 'border-line bg-surface text-navy-900 hover:border-navy-600';
        if (!slot.tersedia) classes = 'border-line bg-line/40 text-muted line-through';
        else if (isSelected) classes = 'border-gold-500 bg-navy-900 text-ivory';

        return (
          <button
            key={slot.jam_mulai}
            type="button"
            disabled={!slot.tersedia}
            aria-pressed={slot.tersedia ? isSelected : undefined}
            aria-label={slot.tersedia ? label : `${label}, tidak tersedia`}
            onClick={() => onToggle(slot)}
            className={`h-11 rounded-md border text-sm font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed ${classes}`}
          >
            {slot.jam_mulai}
          </button>
        );
      })}
    </div>
  );
}

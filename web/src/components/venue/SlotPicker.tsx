import type { Slot } from '../../lib/types.ts';

type SlotPickerProps = {
  slots: Slot[];
  selected: string[];
  onToggle: (slot: Slot) => void;
};

/**
 * Pilihan jam 44px. Kosong: bergaris tipis. Dipilih: hijau aksen dengan tanda centang tersirat
 * lewat warna + aria-pressed. Terisi: dicoret dan nonaktif, jadi tidak hanya dibedakan warna.
 */
export function SlotPicker({ slots, selected, onToggle }: SlotPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = selected.includes(slot.jam_mulai);
        const label = `${slot.jam_mulai}–${slot.jam_selesai}`;
        let classes = 'border-line bg-raised text-fg hover:border-muted';
        if (!slot.tersedia) classes = 'border-transparent bg-surface text-muted/60 line-through';
        else if (isSelected) classes = 'border-accent bg-accent text-on-accent';

        return (
          <button
            key={slot.jam_mulai}
            type="button"
            disabled={!slot.tersedia}
            aria-pressed={slot.tersedia ? isSelected : undefined}
            aria-label={slot.tersedia ? label : `${label}, sudah terisi`}
            onClick={() => onToggle(slot)}
            className={`h-11 rounded-xl border text-sm font-semibold tabular-nums transition-colors duration-150 ease-out disabled:cursor-not-allowed ${classes}`}
          >
            {slot.jam_mulai}
          </button>
        );
      })}
    </div>
  );
}

import type { Slot } from '../../lib/types.ts';

type SlotPickerProps = {
  slots: Slot[];
  selected: string[];
  onToggle: (slot: Slot) => void;
};

/**
 * Kotak 44px per jam, angka condensed ala papan skor. Tersedia: surface-2 bergaris.
 * Dipilih: Volt dengan teks Ink. Tidak tersedia: pola diagonal, dicoret, dan nonaktif,
 * jadi tidak hanya dibedakan lewat warna.
 */
export function SlotPicker({ slots, selected, onToggle }: SlotPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {slots.map((slot) => {
        const isSelected = selected.includes(slot.jam_mulai);
        const label = `${slot.jam_mulai}–${slot.jam_selesai}`;
        let classes = 'border-line bg-surface-2 text-fg hover:border-fg';
        if (!slot.tersedia)
          classes = 'stripes border-line/60 bg-surface text-muted/60 line-through';
        else if (isSelected) classes = 'border-volt bg-volt text-ink';

        return (
          <button
            key={slot.jam_mulai}
            type="button"
            disabled={!slot.tersedia}
            aria-pressed={slot.tersedia ? isSelected : undefined}
            aria-label={slot.tersedia ? label : `${label}, tidak tersedia`}
            onClick={() => onToggle(slot)}
            className={`h-11 rounded-md border font-display text-lg font-bold tabular-nums transition-colors duration-150 ease-out disabled:cursor-not-allowed ${classes}`}
          >
            {slot.jam_mulai}
          </button>
        );
      })}
    </div>
  );
}

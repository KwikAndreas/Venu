// Kelas Tailwind bersama untuk komponen UI (DESIGN.md §5).

export type ButtonVariant =
  'primary' | 'neutral' | 'secondary' | 'ghost' | 'danger' | 'danger-outline' | 'danger-ghost';
export type ButtonSize = 'md' | 'sm' | 'icon';

const BUTTON_BASE =
  'group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full ' +
  'font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  // Aksi utama halaman (pesan, cari, kirim). Satu per layar.
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  // Aksi tegas yang netral (masuk, bandingkan di baki).
  neutral: 'bg-fg text-bg hover:opacity-90',
  secondary: 'border border-line bg-raised text-fg hover:border-muted',
  ghost: 'text-fg hover:bg-surface',
  danger: 'bg-danger text-raised hover:opacity-90',
  // Pemicu aksi destruktif di daftar; konfirmasinya tetap memakai tombol `danger`.
  'danger-outline': 'border border-danger/40 text-danger hover:bg-danger-soft',
  // Aksi destruktif sekunder di daftar (mis. Batalkan) agar tidak bersaing dengan aksi utama.
  'danger-ghost': 'text-danger hover:bg-danger-soft',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-[15px]',
  sm: 'h-9 px-4 text-sm',
  icon: 'size-10',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${extra}`;
}

export function inputClasses(invalid: boolean, extra = ''): string {
  const border = invalid ? 'border-danger' : 'border-line';
  return (
    `w-full rounded-xl border ${border} bg-raised px-3.5 text-[15px] text-fg ` +
    'placeholder:text-muted/70 transition duration-150 ease-out hover:border-muted ' +
    'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 ' +
    `disabled:opacity-50 ${extra}`
  );
}

/** Pil filter (kota, tanggal, jam, urutan) yang berisi select/input asli. */
export const PILL_CLASSES =
  'h-10 rounded-full border border-line bg-raised px-4 text-sm font-semibold text-fg ' +
  'transition-colors hover:border-muted focus-visible:border-accent focus-visible:outline-none';

export const CARD_CLASSES = 'rounded-2xl border border-line bg-raised';

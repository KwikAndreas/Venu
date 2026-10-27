// Kelas Tailwind bersama untuk komponen UI (DESIGN.md §5).

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-outline' | 'ghost';
export type ButtonSize = 'md' | 'sm' | 'icon';

const BUTTON_BASE =
  'group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ' +
  'font-display font-bold uppercase tracking-[0.04em] transition-colors duration-150 ease-out ' +
  'disabled:cursor-not-allowed disabled:opacity-40';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  // CTA utama: Volt dengan teks Ink. Pakai satu per layar.
  primary: 'bg-volt text-ink hover:bg-volt-600',
  secondary: 'border border-line bg-surface-2 text-fg hover:border-fg',
  danger: 'bg-danger text-ink hover:bg-danger/85',
  // Pemicu aksi destruktif di daftar; konfirmasinya tetap memakai tombol `danger`.
  'danger-outline': 'border border-danger/60 text-danger hover:bg-danger/10',
  ghost: 'text-fg hover:bg-surface-2',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-base',
  sm: 'h-10 px-3.5 text-sm',
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
    `w-full rounded-md border ${border} bg-surface-2 px-3 text-base text-fg ` +
    'placeholder:text-muted/70 transition-colors duration-150 ease-out hover:border-muted ' +
    'focus-visible:border-volt focus-visible:outline-none ' +
    `disabled:opacity-50 ${extra}`
  );
}

export const CARD_CLASSES = 'rounded-lg border border-line bg-surface';

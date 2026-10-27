// Kelas Tailwind bersama untuk komponen UI (DESIGN.md §5).

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'danger' | 'danger-outline' | 'ghost' | 'on-dark';
export type ButtonSize = 'md' | 'sm' | 'icon';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ' +
  'transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  // CTA utama: emas dengan teks Navy. Pakai satu per layar.
  primary: 'bg-gold-500 text-navy-900 hover:bg-gold-600',
  secondary: 'bg-navy-900 text-ivory hover:bg-navy-800',
  outline: 'border border-navy-900 text-navy-900 hover:bg-gold-100',
  danger: 'bg-danger text-white hover:bg-danger-700',
  // Pemicu aksi destruktif di daftar; konfirmasinya tetap memakai tombol `danger`.
  'danger-outline': 'border border-danger text-danger-700 hover:bg-danger-50',
  ghost: 'text-navy-900 hover:bg-gold-100',
  // Tombol garis untuk latar Navy (navbar, hero).
  'on-dark': 'border border-ivory/50 text-ivory hover:bg-navy-800',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-sm',
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
    `w-full rounded-sm border ${border} bg-surface px-3 text-sm text-navy-900 ` +
    'placeholder:text-muted/70 transition-colors duration-150 ease-out ' +
    'focus-visible:border-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60 ' +
    `disabled:bg-ivory disabled:text-muted ${extra}`
  );
}

export const CARD_CLASSES = 'rounded-lg border border-line bg-surface shadow-card';

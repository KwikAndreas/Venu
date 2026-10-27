import type { ComponentProps, ReactNode } from 'react';
import { CARD_CLASSES } from './styles.ts';

/** Lebar konten maksimum 1200px di tengah (DESIGN.md §4). */
export function Container({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${className}`} {...rest} />;
}

export function Card({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`${CARD_CLASSES} ${className}`} {...rest} />;
}

/** Label kecil berawalan garis miring Volt, dipakai di atas judul halaman/bagian. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`type-label text-muted ${className}`}>
      <span className="mr-1.5 text-volt" aria-hidden>
        //
      </span>
      {children}
    </p>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h1 className="type-h1 text-fg">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: ReactNode;
  note?: string;
  /** Garis atas Volt; pakai hanya untuk angka terpenting di satu layar. */
  highlight?: boolean;
};

/** Papan skor: label kapital kecil, angka besar condensed tabular, catatan kecil. */
export function StatCard({ label, value, note, highlight = false }: StatCardProps) {
  return (
    <Card className={`p-5 ${highlight ? 'border-t-2 border-t-volt' : ''}`}>
      <p className="type-label text-muted">{label}</p>
      <p className={`type-score mt-3 ${highlight ? 'text-volt' : 'text-fg'}`}>{value}</p>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </Card>
  );
}

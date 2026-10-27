import type { ComponentProps, ReactNode } from 'react';
import { CARD_CLASSES } from './styles.ts';

/** Lebar konten maksimum 1160px di tengah (DESIGN.md §4). */
export function Container({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`mx-auto w-full max-w-[1160px] px-5 sm:px-8 ${className}`} {...rest} />;
}

export function Card({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`${CARD_CLASSES} ${className}`} {...rest} />;
}

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="type-h1 text-fg">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: ReactNode;
  note?: string;
  /** Penanda angka yang paling perlu perhatian di satu layar. */
  highlight?: boolean;
};

export function StatCard({ label, value, note, highlight = false }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-2 text-[28px] font-bold leading-none tracking-tight tabular-nums ${highlight ? 'text-accent' : 'text-fg'}`}
      >
        {value}
      </p>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </Card>
  );
}

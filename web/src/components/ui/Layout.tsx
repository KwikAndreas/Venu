import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { CARD_CLASSES } from './styles.ts';

/** Lebar konten maksimum 1200px di tengah (DESIGN.md §4). */
export function Container({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${className}`} {...rest} />;
}

export function Card({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`${CARD_CLASSES} ${className}`} {...rest} />;
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="type-caption mb-2 text-muted">{eyebrow}</p>}
        <h1 className="type-h1 text-navy-900">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  note?: string;
};

/** Angka besar Playfair, label caption muted, ikon dalam lingkaran Gold 100. */
export function StatCard({ icon: Icon, label, value, note }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-gold-100">
        <Icon className="size-5 text-navy-900" aria-hidden />
      </div>
      <p className="type-caption text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-navy-900">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </Card>
  );
}

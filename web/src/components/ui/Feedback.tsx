import { CircleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

/** Placeholder pemuatan; dipakai sebagai pengganti spinner layar penuh. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-surface-2 ${className}`} />;
}

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

/** Ikon bergaris besar di panel berpola diagonal, judul H2, maksimal satu tombol aksi. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="stripes flex flex-col items-center rounded-lg border border-dashed border-line px-6 py-14 text-center">
      <Icon className="mb-5 size-12 text-muted" strokeWidth={1.25} aria-hidden />
      <h2 className="type-h2 text-fg">{title}</h2>
      {description && <p className="mt-2 max-w-md text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Gagal memuat data"
      description={message}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Coba lagi
          </Button>
        )
      }
    />
  );
}

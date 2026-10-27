import { CircleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

/** Placeholder pemuatan; dipakai sebagai pengganti spinner layar penuh. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
}

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

/** Ikon bergaris dalam lingkaran, judul Playfair, dan maksimal satu tombol aksi. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full border border-gold-300 bg-gold-100">
        <Icon className="size-7 text-navy-600" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="type-h2 text-navy-900">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
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
          <Button variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        )
      }
    />
  );
}

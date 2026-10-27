import { CircleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

/** Placeholder pemuatan; dipakai sebagai pengganti spinner layar penuh. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-surface ${className}`} />;
}

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

/** Ikon tipis dalam lingkaran lembut, judul, kalimat singkat, maksimal satu aksi. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface px-6 py-14 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-raised">
        <Icon className="size-5 text-muted" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="type-h3 text-fg">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
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

import type { ReactNode } from 'react';
import { Card } from '../../components/ui/Layout.tsx';

/** Kartu terpusat untuk halaman masuk/daftar (DESIGN.md §9). */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex justify-center px-5 py-12 sm:py-20">
      <Card className="w-full max-w-[420px] p-7 shadow-soft sm:p-9">
        <h1 className="type-h1 text-fg">{title}</h1>
        <p className="mt-1.5 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </Card>
    </div>
  );
}

export function FormError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
    >
      {message}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Card } from '../../components/ui/Layout.tsx';

/** Kartu terpusat di latar Ivory untuk halaman masuk/daftar (DESIGN.md §9). */
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
    <div className="flex justify-center px-4 py-12 sm:py-20">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="type-h1 text-navy-900">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 border-t border-line pt-6 text-center text-sm text-muted">
          {footer}
        </div>
      </Card>
    </div>
  );
}

export function FormError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 rounded-md border border-danger/30 bg-danger-50 px-4 py-3 text-sm text-danger-700"
    >
      {message}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Card, Eyebrow } from '../../components/ui/Layout.tsx';

/** Panel terpusat di atas latar Ink bergaris diagonal untuk halaman masuk/daftar (DESIGN.md §9). */
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
    <div className="stripes flex justify-center border-b border-line px-4 py-12 sm:py-20">
      <Card className="w-full max-w-md border-t-2 border-t-volt p-6 sm:p-8">
        <Eyebrow>Akun Venu</Eyebrow>
        <h1 className="type-h1 mt-3 text-fg">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
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
      className="mb-5 rounded-md border border-l-4 border-danger/40 border-l-danger bg-danger/10 px-4 py-3 text-sm text-danger"
    >
      {message}
    </div>
  );
}

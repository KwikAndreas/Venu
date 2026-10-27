import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ButtonLink } from '../components/ui/Button.tsx';
import { EmptyState, Skeleton } from '../components/ui/Feedback.tsx';
import { Container } from '../components/ui/Layout.tsx';
import type { Role } from '../lib/types.ts';
import { homePathFor, useAuth } from './auth-context.ts';

/**
 * Penjaga rute di sisi tampilan. Ini hanya untuk kenyamanan pengguna; hak akses yang
 * sebenarnya tetap diperiksa backend di setiap request.
 */
export function RequireRole({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <Container className="space-y-4 py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </Container>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/masuk?next=${next}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={ShieldCheck}
          title="Halaman tidak tersedia"
          description="Akunmu tidak punya akses ke halaman ini."
          action={<ButtonLink to={homePathFor(user.role)}>Kembali ke beranda</ButtonLink>}
        />
      </Container>
    );
  }

  return children;
}

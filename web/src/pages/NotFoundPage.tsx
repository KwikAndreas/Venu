import { Flag } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button.tsx';
import { EmptyState } from '../components/ui/Feedback.tsx';
import { Container } from '../components/ui/Layout.tsx';

export function NotFoundPage() {
  return (
    <Container className="py-16">
      <EmptyState
        icon={Flag}
        title="Halaman tidak ditemukan"
        description="Alamat yang kamu buka tidak ada atau sudah dipindahkan."
        action={<ButtonLink to="/">Kembali ke beranda</ButtonLink>}
      />
    </Container>
  );
}

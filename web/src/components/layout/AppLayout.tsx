import { Outlet, ScrollRestoration } from 'react-router';
import { IS_BEFORE_MODE } from '../../lib/security-mode.ts';
import { Container } from '../ui/Layout.tsx';
import { Logo, Navbar } from './Navbar.tsx';
import { SecurityModeBanner } from './SecurityModeBanner.tsx';

function Footer() {
  return (
    <footer className="mt-24 overflow-hidden border-t border-line">
      <Container className="flex flex-col gap-6 pt-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <p className="type-h3 text-fg">Main lebih sering.</p>
          <p className="mt-2 text-sm text-muted">
            Booking lapangan futsal, badminton, dan basket tanpa telepon sana-sini.
          </p>
        </div>
        <p className="type-label text-muted">
          Proyek Secure Application Development · Asta Cita 4 · Data dummy, pembayaran simulasi
        </p>
      </Container>
      {/* Wordmark raksasa yang terpotong di tepi bawah, seperti tulisan di lantai lapangan. */}
      <Container
        aria-hidden
        className="pointer-events-none -mb-6 mt-8 select-none opacity-[0.07] md:-mb-10"
      >
        <Logo size="xl" />
      </Container>
    </footer>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#konten"
        className="sr-only z-50 rounded-md bg-volt px-4 py-2 font-display font-bold uppercase text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lewati ke konten
      </a>
      {IS_BEFORE_MODE && <SecurityModeBanner />}
      <Navbar />
      <main id="konten" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}

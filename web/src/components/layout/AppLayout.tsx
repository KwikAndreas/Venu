import { Outlet, ScrollRestoration } from 'react-router';
import { IS_BEFORE_MODE } from '../../lib/security-mode.ts';
import { Container } from '../ui/Layout.tsx';
import { Logo, Navbar } from './Navbar.tsx';
import { SecurityModeBanner } from './SecurityModeBanner.tsx';

function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <Container className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span>Booking lapangan futsal, badminton, dan basket.</span>
        </div>
        <span>Proyek Secure Application Development · data dummy, pembayaran simulasi</span>
      </Container>
    </footer>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#konten"
        className="sr-only z-50 rounded-full bg-accent px-4 py-2 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
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

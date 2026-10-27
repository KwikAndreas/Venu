import { Outlet, ScrollRestoration } from 'react-router';
import { Container } from '../ui/Layout.tsx';
import { Logo, Navbar } from './Navbar.tsx';

function Footer() {
  return (
    <footer className="mt-16 bg-navy-900 text-ivory/75">
      <Container className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm">
            Booking lapangan futsal, badminton, dan basket dengan mudah.
          </p>
        </div>
        <p className="text-xs text-ivory/60">
          Proyek Secure Application Development · Asta Cita 4 · Data dummy, pembayaran simulasi
        </p>
      </Container>
    </footer>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#konten"
        className="sr-only z-50 rounded-md bg-gold-500 px-4 py-2 text-navy-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lewati ke konten
      </a>
      <Navbar />
      <main id="konten" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}

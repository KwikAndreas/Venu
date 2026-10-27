import { LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../auth/auth-context.ts';
import type { Role } from '../../lib/types.ts';
import { Button, ButtonLink } from '../ui/Button.tsx';
import { Container } from '../ui/Layout.tsx';

type NavItem = { to: string; label: string; end?: boolean; roles?: Role[] };

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/cari', label: 'Cari Lapangan' },
  { to: '/riwayat', label: 'Riwayat', roles: ['penyewa'] },
  { to: '/pemilik', label: 'Dashboard', roles: ['pemilik'] },
  { to: '/admin', label: 'Panel Admin', roles: ['admin'] },
];

export function Logo() {
  return (
    <Link to="/" className="font-display text-2xl font-semibold tracking-normal text-ivory">
      Venu<span className="text-gold-500">.</span>
    </Link>
  );
}

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  const state = isActive
    ? 'border-gold-500 text-ivory'
    : 'border-transparent text-ivory/75 hover:text-ivory';
  return `inline-flex h-16 items-center border-b-2 px-1 text-sm font-medium transition-colors duration-150 ease-out ${state}`;
}

function mobileLinkClasses({ isActive }: { isActive: boolean }): string {
  const state = isActive
    ? 'border-gold-500 bg-navy-800 text-ivory'
    : 'border-transparent text-ivory/80';
  return `flex h-11 items-center border-l-2 px-4 text-sm font-medium ${state}`;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-900">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Menu utama" className="hidden flex-1 gap-6 md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClasses}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/profil"
                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-ivory/85 hover:bg-navy-800 hover:text-ivory"
              >
                <User className="size-4" aria-hidden />
                <span className="max-w-40 truncate">{user.nama}</span>
              </Link>
              <Button variant="on-dark" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/masuk"
                className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-ivory/85 hover:text-ivory"
              >
                Masuk
              </Link>
              <ButtonLink to="/daftar" variant="on-dark" size="sm">
                Daftar
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          className="flex size-11 items-center justify-center rounded-md text-ivory hover:bg-navy-800 md:hidden"
        >
          {menuOpen ? (
            <X className="size-6" aria-hidden />
          ) : (
            <Menu className="size-6" aria-hidden />
          )}
        </button>
      </Container>

      {menuOpen && (
        <div id="menu-mobile" className="border-t border-navy-600 pb-3 md:hidden">
          <nav aria-label="Menu utama (mobile)" className="py-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMenu}
                className={mobileLinkClasses}
              >
                {item.label}
              </NavLink>
            ))}
            {user && (
              <NavLink to="/profil" onClick={closeMenu} className={mobileLinkClasses}>
                Profil ({user.nama})
              </NavLink>
            )}
          </nav>
          <div className="flex gap-2 px-4">
            {user ? (
              <Button variant="on-dark" size="sm" className="flex-1" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden />
                Keluar
              </Button>
            ) : (
              <>
                <ButtonLink
                  to="/masuk"
                  variant="on-dark"
                  size="sm"
                  className="flex-1"
                  onClick={closeMenu}
                >
                  Masuk
                </ButtonLink>
                <ButtonLink
                  to="/daftar"
                  variant="on-dark"
                  size="sm"
                  className="flex-1"
                  onClick={closeMenu}
                >
                  Daftar
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

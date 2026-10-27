import { LogOut, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../auth/auth-context.ts';
import type { Role } from '../../lib/types.ts';
import { Button, ButtonLink } from '../ui/Button.tsx';
import { Container } from '../ui/Layout.tsx';

type NavItem = { to: string; label: string; end?: boolean; roles?: Role[] };

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/cari', label: 'Lapangan' },
  { to: '/riwayat', label: 'Riwayat', roles: ['penyewa'] },
  { to: '/pemilik', label: 'Dashboard', roles: ['pemilik'] },
  { to: '/admin', label: 'Panel Admin', roles: ['admin'] },
];

/** Logo: "VENU" condensed tebal miring dengan garis miring Volt. */
export function Logo({ size = 'md' }: { size?: 'md' | 'xl' }) {
  const text = size === 'xl' ? 'text-7xl md:text-9xl' : 'text-3xl';
  return (
    <Link
      to="/"
      aria-label="Venu, ke beranda"
      className={`font-display font-extrabold italic uppercase leading-none tracking-tight text-fg ${text}`}
    >
      Venu<span className="text-volt">/</span>
    </Link>
  );
}

const LINK_BASE =
  'font-display text-base font-bold uppercase tracking-[0.06em] transition-colors duration-150 ease-out';

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  const state = isActive ? 'border-volt text-fg' : 'border-transparent text-muted hover:text-fg';
  return `${LINK_BASE} inline-flex h-16 items-center border-b-[3px] pt-[3px] ${state}`;
}

function mobileLinkClasses({ isActive }: { isActive: boolean }): string {
  const state = isActive ? 'border-volt bg-surface text-fg' : 'border-transparent text-muted';
  return `${LINK_BASE} flex h-12 items-center border-l-[3px] px-4 ${state}`;
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
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-8">
        <Logo />

        <nav aria-label="Menu utama" className="hidden flex-1 gap-7 md:flex">
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
                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"
              >
                <UserRound className="size-4" aria-hidden />
                <span className="max-w-40 truncate">{user.nama}</span>
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/masuk"
                className={`${LINK_BASE} inline-flex h-10 items-center px-3 text-muted hover:text-fg`}
              >
                Masuk
              </Link>
              <ButtonLink to="/daftar" variant="secondary" size="sm">
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
          className="flex size-11 items-center justify-center rounded-md text-fg hover:bg-surface-2 md:hidden"
        >
          {menuOpen ? (
            <X className="size-6" aria-hidden />
          ) : (
            <Menu className="size-6" aria-hidden />
          )}
        </button>
      </Container>

      {menuOpen && (
        <div id="menu-mobile" className="border-t border-line pb-4 md:hidden">
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
                Profil
              </NavLink>
            )}
          </nav>
          <div className="flex gap-2 px-4">
            {user ? (
              <Button variant="secondary" size="sm" className="flex-1" onClick={handleLogout}>
                <LogOut className="size-4" aria-hidden />
                Keluar ({user.nama})
              </Button>
            ) : (
              <>
                <ButtonLink
                  to="/masuk"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={closeMenu}
                >
                  Masuk
                </ButtonLink>
                <ButtonLink
                  to="/daftar"
                  variant="secondary"
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

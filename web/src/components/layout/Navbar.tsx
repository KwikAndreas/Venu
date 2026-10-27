import { LogOut, Menu, Moon, Sun, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../auth/auth-context.ts';
import { useActiveBookings } from '../../bookings/active-bookings-context.ts';
import type { Role, User } from '../../lib/types.ts';
import { useTheme } from '../../theme/theme-context.ts';
import { ButtonLink } from '../ui/Button.tsx';
import { Container } from '../ui/Layout.tsx';

type NavItem = { to: string; label: string; end?: boolean; roles?: Role[]; showCount?: boolean };

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Cari lapangan', end: true },
  { to: '/riwayat', label: 'Booking saya', roles: ['penyewa'], showCount: true },
  { to: '/pemilik', label: 'Dashboard', roles: ['pemilik'] },
  { to: '/admin', label: 'Panel admin', roles: ['admin'] },
];

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Venu, ke beranda"
      className="text-xl font-extrabold tracking-tight text-fg"
    >
      venu<span className="text-accent">.</span>
    </Link>
  );
}

function initials(nama: string): string {
  return nama
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-bold text-on-accent">
      {count}
      <span className="sr-only"> booking aktif</span>
    </span>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-fg"
    >
      {theme === 'dark' ? (
        <Sun className="size-[18px]" aria-hidden />
      ) : (
        <Moon className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}

/** Avatar + nama; membuka menu kecil berisi Profil dan Keluar. */
function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (event instanceof MouseEvent && menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-2.5 rounded-full py-1 pl-1 pr-3 font-semibold text-fg transition-colors hover:bg-surface"
      >
        <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">
          {initials(user.nama)}
        </span>
        <span className="max-w-40 truncate text-sm">{user.nama}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-line bg-raised p-1.5 shadow-soft"
        >
          <Link
            role="menuitem"
            to="/profil"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium hover:bg-surface"
          >
            <UserRound className="size-4 text-muted" aria-hidden />
            Profil
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium hover:bg-surface"
          >
            <LogOut className="size-4 text-muted" aria-hidden />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

function linkClasses({ isActive }: { isActive: boolean }): string {
  const state = isActive ? 'text-fg' : 'text-muted hover:text-fg';
  return `inline-flex items-center text-[15px] font-semibold transition-colors duration-150 ${state}`;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { active } = useActiveBookings();
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
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/90 backdrop-blur">
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Menu utama" className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses}>
              {item.label}
              {item.showCount && <CountBadge count={active.length} />}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <ButtonLink to="/masuk" variant="neutral" size="sm" className="h-10 px-5">
              Masuk
            </ButtonLink>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            className="flex size-10 items-center justify-center rounded-full text-fg hover:bg-surface"
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div id="menu-mobile" className="border-t border-line pb-4 md:hidden">
          <Container>
            <nav aria-label="Menu utama (mobile)" className="flex flex-col py-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={(state) => `${linkClasses(state)} h-12`}
                >
                  {item.label}
                  {item.showCount && <CountBadge count={active.length} />}
                </NavLink>
              ))}
              {user && (
                <NavLink
                  to="/profil"
                  onClick={closeMenu}
                  className={(state) => `${linkClasses(state)} h-12`}
                >
                  Profil
                </NavLink>
              )}
            </nav>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold"
              >
                <LogOut className="size-4" aria-hidden />
                Keluar
              </button>
            ) : (
              <ButtonLink to="/masuk" variant="neutral" className="w-full" onClick={closeMenu}>
                Masuk
              </ButtonLink>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}

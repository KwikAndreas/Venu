import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from './Button.tsx';

/** Tabel dashboard: header lembut, baris bergaris tipis, hover menyorot baris. */
export function Table({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-raised">
      <table aria-label={label} className="w-full min-w-[720px] text-left">
        {children}
      </table>
    </div>
  );
}

export function Th({ className = '', ...rest }: ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={`bg-surface px-4 py-3 text-[13px] font-semibold text-muted ${className}`}
      {...rest}
    />
  );
}

export function Tr({ className = '', ...rest }: ComponentProps<'tr'>) {
  return (
    <tr
      className={`border-t border-line transition-colors duration-150 hover:bg-surface/60 ${className}`}
      {...rest}
    />
  );
}

export function Td({ className = '', ...rest }: ComponentProps<'td'>) {
  return <td className={`px-4 py-3.5 align-middle text-sm text-fg ${className}`} {...rest} />;
}

type IconActionProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

/** Aksi baris berupa ikon; label tetap dibacakan pembaca layar dan tampil sebagai tooltip. */
export function IconAction({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
  disabled,
}: IconActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        tone === 'danger' ? 'text-danger hover:bg-danger-soft' : 'text-muted hover:text-fg'
      }
    >
      <Icon className="size-[18px]" aria-hidden />
    </Button>
  );
}

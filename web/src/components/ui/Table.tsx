import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from './Button.tsx';

/** Tabel dashboard: header latar Ivory dengan caption kapital, baris bergaris tipis, zebra halus. */
export function Table({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-card">
      <table aria-label={label} className="w-full min-w-[720px] text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ className = '', ...rest }: ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={`type-caption bg-ivory px-4 py-3 text-muted ${className}`}
      {...rest}
    />
  );
}

export function Tr({ className = '', ...rest }: ComponentProps<'tr'>) {
  return <tr className={`border-t border-line even:bg-ivory/40 ${className}`} {...rest} />;
}

export function Td({ className = '', ...rest }: ComponentProps<'td'>) {
  return <td className={`px-4 py-3 align-middle text-navy-900 ${className}`} {...rest} />;
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
      className={tone === 'danger' ? 'text-danger-700 hover:bg-danger-50' : ''}
    >
      <Icon className="size-[18px]" aria-hidden />
    </Button>
  );
}

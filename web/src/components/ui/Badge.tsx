import { Ban, CircleCheck, CircleX, Flag, Hourglass, type LucideIcon } from 'lucide-react';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, SPORT_LABELS } from '../../lib/format.ts';
import type { BookingStatus, PaymentStatus, Sport } from '../../lib/types.ts';

type Tone = 'warning' | 'success' | 'danger' | 'info' | 'neutral';

const TONE_CLASSES: Record<Tone, string> = {
  warning: 'border-warning bg-warning/12 text-warning',
  success: 'border-success bg-success/12 text-success',
  danger: 'border-danger bg-danger/12 text-danger',
  info: 'border-info bg-info/12 text-info',
  neutral: 'border-muted bg-surface-2 text-muted',
};

/** Badge status: teks + latar 12% + garis kiri warna status, selalu dengan ikon (DESIGN.md §5). */
function StatusPill({ tone, icon: Icon, label }: { tone: Tone; icon: LucideIcon; label: string }) {
  return (
    <span
      className={`type-label inline-flex items-center gap-1.5 rounded-sm border-l-2 py-1 pl-1.5 pr-2 ${TONE_CLASSES[tone]}`}
    >
      <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
      {label}
    </span>
  );
}

const BOOKING_STATUS_STYLE: Record<BookingStatus, { tone: Tone; icon: LucideIcon }> = {
  menunggu: { tone: 'warning', icon: Hourglass },
  dikonfirmasi: { tone: 'success', icon: CircleCheck },
  ditolak: { tone: 'danger', icon: CircleX },
  dibatalkan: { tone: 'danger', icon: Ban },
  selesai: { tone: 'info', icon: Flag },
};

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, { tone: Tone; icon: LucideIcon }> = {
  menunggu: { tone: 'warning', icon: Hourglass },
  lunas: { tone: 'success', icon: CircleCheck },
  gagal: { tone: 'danger', icon: CircleX },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <StatusPill {...BOOKING_STATUS_STYLE[status]} label={BOOKING_STATUS_LABELS[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus | null }) {
  if (status === null) {
    return <StatusPill tone="neutral" icon={Hourglass} label="Belum dibayar" />;
  }
  return <StatusPill {...PAYMENT_STATUS_STYLE[status]} label={PAYMENT_STATUS_LABELS[status]} />;
}

export function SportBadge({ sport }: { sport: Sport }) {
  return (
    <span className="type-label inline-flex items-center rounded-sm border border-line px-2 py-1 text-fg">
      {SPORT_LABELS[sport]}
    </span>
  );
}

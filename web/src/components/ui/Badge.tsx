import { Ban, CircleCheck, CircleX, Flag, Hourglass, type LucideIcon } from 'lucide-react';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, SPORT_LABELS } from '../../lib/format.ts';
import type { BookingStatus, PaymentStatus, Sport } from '../../lib/types.ts';

type Tone = 'warning' | 'success' | 'danger' | 'neutral';

const TONE_CLASSES: Record<Tone, string> = {
  warning: 'bg-warning-50 text-warning-700',
  success: 'bg-success-50 text-success-700',
  danger: 'bg-danger-50 text-danger-700',
  neutral: 'bg-navy-50 text-navy-600',
};

/** Badge status: latar tint lembut + teks gelap + ikon, tidak hanya mengandalkan warna. */
function StatusPill({ tone, icon: Icon, label }: { tone: Tone; icon: LucideIcon; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

const BOOKING_STATUS_STYLE: Record<BookingStatus, { tone: Tone; icon: LucideIcon }> = {
  menunggu: { tone: 'warning', icon: Hourglass },
  dikonfirmasi: { tone: 'success', icon: CircleCheck },
  ditolak: { tone: 'danger', icon: CircleX },
  dibatalkan: { tone: 'danger', icon: Ban },
  selesai: { tone: 'neutral', icon: Flag },
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
    <span className="inline-flex items-center rounded-sm bg-gold-100 px-2 py-1 text-xs font-medium text-navy-900">
      {SPORT_LABELS[sport]}
    </span>
  );
}

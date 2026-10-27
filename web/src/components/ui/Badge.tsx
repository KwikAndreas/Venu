import type { Stage, StageTone } from '../../lib/booking-stage.ts';
import { SPORT_LABELS } from '../../lib/format.ts';
import type { Sport } from '../../lib/types.ts';

const TONE_CLASSES: Record<StageTone, string> = {
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-surface text-muted',
};

/**
 * Satu-satunya penanda status booking. Status booking dan pembayaran sudah digabung oleh
 * lib/booking-stage.ts, jadi tidak pernah tampil dua badge yang saling mengulang.
 */
export function StatusBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-semibold ${TONE_CLASSES[stage.tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {stage.label}
    </span>
  );
}

export function SportBadge({ sport }: { sport: Sport }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
      {SPORT_LABELS[sport]}
    </span>
  );
}

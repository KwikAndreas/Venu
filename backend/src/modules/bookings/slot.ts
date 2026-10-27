import { toMinutes } from '../../lib/time.ts';

export const SLOT_MINUTES = 60;

/** Rentang waktu dalam menit sejak tengah malam, `end` eksklusif. */
export type TimeRange = { start: number; end: number };

export function toRange(jamMulai: string, jamSelesai: string): TimeRange {
  return { start: toMinutes(jamMulai), end: toMinutes(jamSelesai) };
}

/** Semua slot satu jam dari jam buka sampai jam tutup. */
export function dailySlots(jamBuka: string, jamTutup: string): TimeRange[] {
  const slots: TimeRange[] = [];
  const close = toMinutes(jamTutup);
  for (let start = toMinutes(jamBuka); start + SLOT_MINUTES <= close; start += SLOT_MINUTES) {
    slots.push({ start, end: start + SLOT_MINUTES });
  }
  return slots;
}

/** Rentang harus di dalam jam operasional dan tepat mengikuti kelipatan slot. */
export function isOnSlotGrid(jamBuka: string, jamTutup: string, range: TimeRange): boolean {
  const open = toMinutes(jamBuka);
  return (
    range.start >= open &&
    range.end <= toMinutes(jamTutup) &&
    range.end > range.start &&
    (range.start - open) % SLOT_MINUTES === 0 &&
    (range.end - range.start) % SLOT_MINUTES === 0
  );
}

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

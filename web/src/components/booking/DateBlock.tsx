/** Blok tanggal kecil ala kalender: hari, tanggal, bulan. */
export function DateBlock({ date }: { date: string }) {
  const value = new Date(`${date}T00:00:00`);
  const weekday = value.toLocaleDateString('id-ID', { weekday: 'short' });
  const month = value.toLocaleDateString('id-ID', { month: 'short' });

  return (
    <div
      aria-hidden
      className="flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-surface py-2"
    >
      <span className="text-xs font-medium text-muted">{weekday}</span>
      <span className="text-xl font-bold leading-tight tabular-nums text-fg">
        {value.getDate()}
      </span>
      <span className="text-xs font-medium text-muted">{month}</span>
    </div>
  );
}

/** Blok tanggal ala jadwal pertandingan: hari, tanggal besar, bulan. */
export function DateBlock({ date }: { date: string }) {
  const value = new Date(`${date}T00:00:00`);
  const weekday = value.toLocaleDateString('id-ID', { weekday: 'short' });
  const month = value.toLocaleDateString('id-ID', { month: 'short' });

  return (
    <div
      className="flex w-16 shrink-0 flex-col items-center rounded-md border border-line bg-surface-2 py-2"
      aria-hidden
    >
      <span className="type-label text-muted">{weekday}</span>
      <span className="type-score text-fg">{String(value.getDate()).padStart(2, '0')}</span>
      <span className="type-label text-muted">{month}</span>
    </div>
  );
}

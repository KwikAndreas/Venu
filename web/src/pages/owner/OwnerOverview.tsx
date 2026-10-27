import { Banknote, Hourglass, ListChecks, Percent } from 'lucide-react';
import { useState } from 'react';
import { ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { SelectField } from '../../components/ui/Field.tsx';
import { StatCard } from '../../components/ui/Layout.tsx';
import { Table, Td, Th, Tr } from '../../components/ui/Table.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { addDays, formatDate, formatRupiah, todayInJakarta } from '../../lib/format.ts';
import type { OwnerStats } from '../../lib/types.ts';

const PERIOD_OPTIONS = [7, 30, 90] as const;

export function OwnerOverview() {
  const [days, setDays] = useState<number>(30);
  const sampai = todayInJakarta();
  const dari = addDays(sampai, -(days - 1));
  const { data, error, reload } = useApi<OwnerStats>(`/owner/stats?dari=${dari}&sampai=${sampai}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-muted">
          Periode {formatDate(dari)} – {formatDate(sampai)}
        </p>
        <SelectField
          label="Periode"
          className="sm:w-48"
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} hari terakhir
            </option>
          ))}
        </SelectField>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ListChecks}
              label="Total booking"
              value={data.ringkasan.jumlah_booking}
              note={`${data.ringkasan.booking_terkonfirmasi} terkonfirmasi`}
            />
            <StatCard
              icon={Hourglass}
              label="Perlu diproses"
              value={data.ringkasan.booking_menunggu}
              note="Booking berstatus menunggu"
            />
            <StatCard
              icon={Banknote}
              label="Pendapatan"
              value={formatRupiah(data.ringkasan.pendapatan)}
              note="Dari pembayaran lunas"
            />
            <StatCard
              icon={Percent}
              label="Okupansi"
              value={`${data.ringkasan.okupansi_persen}%`}
              note={`${data.ringkasan.jumlah_lapangan} lapangan`}
            />
          </div>

          <section aria-labelledby="judul-per-lapangan" className="space-y-3">
            <h2 id="judul-per-lapangan" className="type-h3 text-navy-900">
              Per lapangan
            </h2>
            <Table label="Statistik per lapangan">
              <thead>
                <tr>
                  <Th>Lapangan</Th>
                  <Th className="text-right">Booking</Th>
                  <Th className="text-right">Terkonfirmasi</Th>
                  <Th className="text-right">Jam terpakai</Th>
                  <Th className="text-right">Okupansi</Th>
                  <Th className="text-right">Pendapatan</Th>
                </tr>
              </thead>
              <tbody>
                {data.per_lapangan.map((venue) => (
                  <Tr key={venue.venue_id}>
                    <Td className="font-medium">{venue.nama}</Td>
                    <Td className="text-right">{venue.jumlah_booking}</Td>
                    <Td className="text-right">{venue.booking_terkonfirmasi}</Td>
                    <Td className="text-right">
                      {venue.jam_terpakai} / {venue.jam_tersedia}
                    </Td>
                    <Td className="text-right">{venue.okupansi_persen}%</Td>
                    <Td className="text-right font-semibold">{formatRupiah(venue.pendapatan)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </section>
        </>
      )}
    </div>
  );
}

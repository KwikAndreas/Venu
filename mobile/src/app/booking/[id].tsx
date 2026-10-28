import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CircleCheck,
  Hourglass,
  ImageUp,
  Landmark,
  QrCode,
  Smartphone,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useActiveBookings } from '@/bookings/active-bookings-context';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { FormError } from '@/components/ui/FormScreen';
import { Card, Divider, InfoRow } from '@/components/ui/Layout';
import { Radius, SCREEN_PADDING, Space } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api, toApiError } from '@/lib/api';
import { MAX_UPLOAD_BYTES } from '@/lib/booking-rules';
import { appendFile, type LocalFile } from '@/lib/form-file';
import {
  formatDate,
  formatRupiah,
  hoursBetween,
  PAYMENT_METHOD_LABELS,
  SPORT_LABELS,
} from '@/lib/format';
import type { BookingSummary, PaymentMethod } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';

// Semua instruksi pembayaran di bawah adalah SIMULASI untuk keperluan tugas.
const METHODS: { value: PaymentMethod; icon: LucideIcon; instruction: string }[] = [
  {
    value: 'transfer',
    icon: Landmark,
    instruction: 'Transfer ke rekening simulasi 000-000-0000 a.n. Venu Demo.',
  },
  {
    value: 'e_wallet',
    icon: Smartphone,
    instruction: 'Kirim ke nomor e-wallet simulasi 0800-0000-0000 a.n. Venu Demo.',
  },
  {
    value: 'qris',
    icon: QrCode,
    instruction: 'Pindai kode QRIS simulasi di kasir lapangan, lalu simpan buktinya.',
  },
];

function BookingSummaryCard({ booking }: { booking: BookingSummary }) {
  const hours = hoursBetween(booking.jam_mulai, booking.jam_selesai);
  return (
    <Card style={styles.card}>
      <View style={styles.tight}>
        <AppText variant="h2">{booking.venue_nama}</AppText>
        <AppText tone="muted">
          {SPORT_LABELS[booking.jenis_olahraga]} · {booking.venue_kota}
        </AppText>
      </View>
      <Divider />
      <InfoRow label="Tanggal">
        <AppText variant="bodyStrong">{formatDate(booking.tanggal)}</AppText>
      </InfoRow>
      <InfoRow label="Jam">
        <AppText variant="bodyStrong" numeric>
          {booking.jam_mulai}–{booking.jam_selesai} ({hours} jam)
        </AppText>
      </InfoRow>
      <InfoRow label="Total">
        <AppText variant="h2" numeric>
          {formatRupiah(booking.total_harga)}
        </AppText>
      </InfoRow>
    </Card>
  );
}

function MethodOption({
  method,
  selected,
  onSelect,
}: {
  method: (typeof METHODS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  const Icon = method.icon;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onSelect}
      style={[
        styles.method,
        {
          borderColor: selected ? colors.accent : colors.line,
          backgroundColor: selected ? colors.accentSoft : colors.raised,
        },
      ]}
    >
      <Icon size={20} color={colors.fg} />
      <View style={styles.flex}>
        <AppText variant="bodyStrong">{PAYMENT_METHOD_LABELS[method.value]}</AppText>
        {selected && (
          <AppText variant="small" tone="muted">
            {method.instruction}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

function PaymentForm({ booking, onPaid }: { booking: BookingSummary; onPaid: () => void }) {
  const { colors } = useTheme();
  const [metode, setMetode] = useState<PaymentMethod>('transfer');
  const [file, setFile] = useState<LocalFile>();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const pickProof = async () => {
    setError(undefined);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;
    if (asset.fileSize && asset.fileSize > MAX_UPLOAD_BYTES) {
      setError('Ukuran file maksimal 2 MB.');
      return;
    }
    setFile({
      uri: asset.uri,
      name: asset.fileName ?? `bukti-${booking.id}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    });
  };

  const submit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(undefined);
    try {
      const form = new FormData();
      form.append('metode', metode);
      await appendFile(form, 'bukti', file);
      await api.upload(`/bookings/${booking.id}/payment`, form);
      onPaid();
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.tight}>
        <AppText variant="h2">Pembayaran</AppText>
        <AppText variant="small" tone="muted">
          Pembayaran ini simulasi. Tidak ada uang yang ditarik.
        </AppText>
      </View>

      <View style={styles.methods} accessibilityRole="radiogroup">
        {METHODS.map((method) => (
          <MethodOption
            key={method.value}
            method={method}
            selected={metode === method.value}
            onSelect={() => setMetode(method.value)}
          />
        ))}
      </View>

      <View style={styles.tight}>
        <AppText variant="label" tone="muted">
          Bukti bayar
        </AppText>
        {file ? (
          <View style={[styles.proof, { borderColor: colors.line }]}>
            <Image source={{ uri: file.uri }} style={styles.thumb} contentFit="cover" />
            <AppText variant="small" numberOfLines={1} style={styles.flex}>
              {file.name}
            </AppText>
            <Button label="Ganti" variant="ghost" size="sm" onPress={pickProof} />
          </View>
        ) : (
          <Button
            label="Pilih foto bukti bayar"
            variant="secondary"
            icon={ImageUp}
            onPress={pickProof}
          />
        )}
        <AppText variant="small" tone="muted">
          JPG atau PNG, maksimal 2 MB.
        </AppText>
      </View>

      <FormError message={error} />
      <Button label="Kirim bukti bayar" onPress={submit} loading={submitting} disabled={!file} />
    </Card>
  );
}

function PaymentStatusPanel({ booking }: { booking: BookingSummary }) {
  const toBookings = (
    <Button
      label="Lihat booking saya"
      variant="secondary"
      onPress={() => router.navigate('/bookings')}
    />
  );
  if (booking.payment_status === 'lunas') {
    return (
      <EmptyState
        icon={CircleCheck}
        title="Pembayaran lunas"
        description="Bookingmu sudah dikonfirmasi pemilik. Sampai jumpa di lapangan!"
        action={toBookings}
      />
    );
  }
  if (booking.payment_status === 'menunggu') {
    return (
      <EmptyState
        icon={Hourglass}
        title="Menunggu konfirmasi pemilik"
        description="Bukti bayar sudah terkirim. Pemilik akan memeriksa lalu mengonfirmasi bookingmu."
        action={toBookings}
      />
    );
  }
  return (
    <EmptyState
      icon={Hourglass}
      title="Booking tidak bisa dibayar"
      description={`Booking ini berstatus "${booking.status}".`}
      action={toBookings}
    />
  );
}

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reload: reloadActive } = useActiveBookings();
  const { data, error, reload } = useApi<{ booking: BookingSummary }>(`/bookings/${id}`);
  const booking = data?.booking;
  const canPay =
    booking?.status === 'menunggu' &&
    (booking.payment_status === null || booking.payment_status === 'gagal');

  const handlePaid = () => {
    reload();
    reloadActive();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !booking ? (
        <>
          <Skeleton height={200} radius={Radius.card} />
          <Skeleton height={320} radius={Radius.card} />
        </>
      ) : (
        <>
          <BookingSummaryCard booking={booking} />
          {canPay ? (
            <PaymentForm booking={booking} onPaid={handlePaid} />
          ) : (
            <PaymentStatusPanel booking={booking} />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: SCREEN_PADDING, gap: Space.lg, paddingBottom: Space.xxxl },
  card: { gap: Space.lg },
  tight: { gap: Space.sm },
  methods: { gap: Space.sm },
  method: {
    flexDirection: 'row',
    gap: Space.md,
    borderWidth: 1,
    borderRadius: Radius.chip,
    padding: Space.lg,
  },
  proof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    borderWidth: 1,
    borderRadius: Radius.chip,
    padding: Space.sm,
  },
  thumb: { width: 44, height: 44, borderRadius: 8 },
});

// Bentuk data respons API backend (lihat README.md bagian Ringkasan API).
// Tanggal/waktu dari JSON berupa string.

export type Role = 'penyewa' | 'pemilik' | 'admin';
export type Sport = 'futsal' | 'badminton' | 'basket';
export type BookingStatus = 'menunggu' | 'dikonfirmasi' | 'ditolak' | 'dibatalkan' | 'selesai';
export type PaymentStatus = 'menunggu' | 'lunas' | 'gagal';
export type PaymentMethod = 'transfer' | 'e_wallet' | 'qris';

export type User = {
  id: number;
  nama: string;
  email: string;
  role: Role;
  created_at: string;
};

export type Venue = {
  id: number;
  owner_id: number;
  nama: string;
  jenis_olahraga: Sport;
  alamat: string;
  kota: string;
  harga_per_jam: number;
  jam_buka: string;
  jam_tutup: string;
  fasilitas: string[];
  foto_url: string | null;
  deskripsi: string | null;
  created_at: string;
  rating_rata: number | null;
  jumlah_ulasan: number;
  /** Jam mulai yang masih kosong; hanya ada bila daftar diminta dengan ?tanggal=. */
  slot_kosong?: string[];
};

export type VenueDetail = Venue & { nama_pemilik: string };

export type VenueInput = {
  nama: string;
  jenis_olahraga: Sport;
  alamat: string;
  kota: string;
  harga_per_jam: number;
  jam_buka: string;
  jam_tutup: string;
  fasilitas: string[];
  deskripsi?: string;
};

export type Slot = {
  jam_mulai: string;
  jam_selesai: string;
  tersedia: boolean;
};

export type VenueSlots = {
  venue_id: number;
  tanggal: string;
  harga_per_jam: number;
  slots: Slot[];
};

export type Booking = {
  id: number;
  user_id: number;
  venue_id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: BookingStatus;
  total_harga: number;
  created_at: string;
};

export type BookingSummary = Booking & {
  venue_nama: string;
  venue_kota: string;
  jenis_olahraga: Sport;
  harga_per_jam: number;
  payment_id: number | null;
  payment_status: PaymentStatus | null;
  payment_metode: PaymentMethod | null;
};

export type Payment = {
  id: number;
  booking_id: number;
  jumlah: number;
  metode: PaymentMethod;
  status: PaymentStatus;
  ada_bukti: boolean;
  created_at: string;
};

export type Review = {
  id: number;
  user_id: number;
  venue_id: number;
  nama_user: string;
  rating: number;
  komentar: string | null;
  created_at: string;
};

export type VenueStats = {
  venue_id: number;
  nama: string;
  jumlah_booking: number;
  booking_menunggu: number;
  booking_terkonfirmasi: number;
  jam_terpakai: number;
  jam_tersedia: number;
  pendapatan: number;
  okupansi_persen: number;
};

export type OwnerStats = {
  periode: { dari: string; sampai: string; hari: number };
  ringkasan: {
    jumlah_lapangan: number;
    jumlah_booking: number;
    booking_menunggu: number;
    booking_terkonfirmasi: number;
    pendapatan: number;
    okupansi_persen: number;
  };
  per_lapangan: VenueStats[];
};

export type OwnerBooking = Booking & {
  venue_nama: string;
  penyewa_nama: string;
  penyewa_email: string;
  payment_id: number | null;
  payment_status: PaymentStatus | null;
  payment_metode: PaymentMethod | null;
  ada_bukti: boolean;
};

export type AdminSummary = {
  users: Record<Role, number>;
  jumlah_lapangan: number;
  jumlah_booking: number;
  booking_menunggu: number;
  pembayaran_lunas: number;
  login_gagal_24_jam: number;
};

export type AdminVenue = {
  id: number;
  nama: string;
  jenis_olahraga: Sport;
  kota: string;
  harga_per_jam: number;
  owner_id: number;
  nama_pemilik: string;
  email_pemilik: string;
  jumlah_booking: number;
  created_at: string;
};

export type AuditLog = {
  id: number;
  user_id: number | null;
  user_email: string | null;
  aksi: string;
  detail: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
};

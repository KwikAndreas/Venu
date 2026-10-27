import { pool } from '../../db/pool.ts';

export const AUDIT_ACTIONS = [
  'auth.register',
  'auth.login_berhasil',
  'auth.login_gagal',
  'alert.login_gagal_beruntun',
  'user.ubah_profil',
  'user.ubah_password',
  'booking.dikonfirmasi',
  'booking.ditolak',
  'admin.ubah_role',
  'admin.hapus_user',
  'admin.hapus_lapangan',
  'admin.hapus_ulasan',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export function isAuditAction(value: unknown): value is AuditAction {
  return typeof value === 'string' && (AUDIT_ACTIONS as readonly string[]).includes(value);
}

export type AuditEntry = {
  userId: number | null;
  aksi: AuditAction;
  detail?: Record<string, unknown>;
  ip: string | null;
};

export type AuditLog = {
  id: number;
  user_id: number | null;
  user_email: string | null;
  aksi: AuditAction;
  detail: Record<string, unknown> | null;
  ip: string | null;
  created_at: Date;
};

export async function insertAuditLog(entry: AuditEntry): Promise<void> {
  await pool.query('INSERT INTO audit_logs (user_id, aksi, detail, ip) VALUES ($1, $2, $3, $4)', [
    entry.userId,
    entry.aksi,
    entry.detail ?? null,
    entry.ip,
  ]);
}

export async function countRecentByIp(
  aksi: AuditAction,
  ip: string,
  windowMinutes: number,
): Promise<number> {
  const { rows } = await pool.query<{ jumlah: number }>(
    `SELECT COUNT(*)::int AS jumlah FROM audit_logs
     WHERE aksi = $1 AND ip = $2 AND created_at > now() - make_interval(mins => $3)`,
    [aksi, ip, windowMinutes],
  );
  return rows[0]?.jumlah ?? 0;
}

export async function listAuditLogs(filter: {
  aksi?: AuditAction;
  limit: number;
}): Promise<AuditLog[]> {
  const { rows } = await pool.query<AuditLog>(
    `SELECT a.id, a.user_id, u.email AS user_email, a.aksi, a.detail, a.ip, a.created_at
     FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
     WHERE ($1::text IS NULL OR a.aksi = $1)
     ORDER BY a.created_at DESC, a.id DESC
     LIMIT $2`,
    [filter.aksi ?? null, filter.limit],
  );
  return rows;
}

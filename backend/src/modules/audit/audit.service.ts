import { isBeforeMode } from '../../config/env.ts';
import { countRecentByIp, insertAuditLog, type AuditEntry } from './audit.repository.ts';

const FAILED_LOGIN_THRESHOLD = 5;
const FAILED_LOGIN_WINDOW_MINUTES = 15;

/**
 * Mencatat event penting (register, login berhasil/gagal, aksi admin, dll).
 * [VULN-A09] Mode before: tidak ada pencatatan sama sekali — fungsi ini no-op, sehingga login
 * gagal beruntun dan aksi admin (hapus user, ubah peran) tidak meninggalkan jejak untuk dilacak.
 * [FIXED-A09] Mode after: setiap event dicatat ke tabel audit_logs.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  if (isBeforeMode) return;
  try {
    await insertAuditLog(entry);
  } catch (error) {
    console.error(`[AUDIT] Gagal mencatat "${entry.aksi}":`, error);
  }
}

/**
 * Mencatat login gagal. [FIXED-A09] Mode after: setiap kali satu IP mencapai kelipatan ambang
 * batas dalam jendela waktu tertentu, dibuat event alert dan peringatan di console server.
 * [VULN-A09] Mode before: tidak dicatat dan tidak ada alert (brute force tidak terdeteksi).
 */
export async function recordFailedLogin(params: {
  email: string;
  userId: number | null;
  ip: string | null;
}): Promise<void> {
  if (isBeforeMode) return;
  await recordAudit({
    userId: params.userId,
    aksi: 'auth.login_gagal',
    detail: { email: params.email },
    ip: params.ip,
  });
  if (!params.ip) return;

  try {
    const failures = await countRecentByIp(
      'auth.login_gagal',
      params.ip,
      FAILED_LOGIN_WINDOW_MINUTES,
    );
    if (failures > 0 && failures % FAILED_LOGIN_THRESHOLD === 0) {
      console.warn(
        `[ALERT] ${failures} login gagal dari IP ${params.ip} dalam ${FAILED_LOGIN_WINDOW_MINUTES} menit terakhir`,
      );
      await recordAudit({
        userId: null,
        aksi: 'alert.login_gagal_beruntun',
        detail: { jumlah: failures, jendela_menit: FAILED_LOGIN_WINDOW_MINUTES },
        ip: params.ip,
      });
    }
  } catch (error) {
    console.error('[AUDIT] Gagal memeriksa pola login gagal:', error);
  }
}

import { countRecentByIp, insertAuditLog, type AuditEntry } from './audit.repository.ts';

const FAILED_LOGIN_THRESHOLD = 5;
const FAILED_LOGIN_WINDOW_MINUTES = 15;

/**
 * Mencatat event penting. Kegagalan menulis log dicetak ke console tetapi tidak
 * menggagalkan request pengguna.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await insertAuditLog(entry);
  } catch (error) {
    console.error(`[AUDIT] Gagal mencatat "${entry.aksi}":`, error);
  }
}

/**
 * Mencatat login gagal. Setiap kali satu IP mencapai kelipatan ambang batas dalam jendela
 * waktu tertentu, dibuat event alert dan peringatan di console server.
 */
export async function recordFailedLogin(params: {
  email: string;
  userId: number | null;
  ip: string | null;
}): Promise<void> {
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

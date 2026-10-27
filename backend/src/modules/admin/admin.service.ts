import { HttpError } from '../../lib/http-error.ts';
import type { AuthUser } from '../../lib/jwt.ts';
import { removeUploadsQuietly } from '../../lib/storage.ts';
import type { Role } from '../../types/role.ts';
import { listAuditLogs, type AuditAction, type AuditLog } from '../audit/audit.repository.ts';
import { recordAudit } from '../audit/audit.service.ts';
import { findUserById, type PublicUser } from '../users/user.repository.ts';
import { findVenueById, listVenueUploadKeys } from '../venues/venue.repository.ts';
import {
  deleteUserById,
  deleteVenueById,
  getAdminSummary,
  listAllVenues,
  listUserUploadKeys,
  listUsers,
  updateUserRole,
  type AdminSummary,
  type AdminVenue,
  type UserFilter,
} from './admin.repository.ts';

export function getSummary(): Promise<AdminSummary> {
  return getAdminSummary();
}

export function searchUsers(filter: UserFilter): Promise<PublicUser[]> {
  return listUsers(filter);
}

function assertNotSelf(admin: AuthUser, targetId: number, action: string): void {
  if (admin.id === targetId) {
    throw new HttpError(400, `Admin tidak bisa ${action} akunnya sendiri`);
  }
}

export async function changeUserRole(
  admin: AuthUser,
  targetId: number,
  role: Role,
  ip: string | null,
): Promise<PublicUser> {
  assertNotSelf(admin, targetId, 'mengubah peran');
  const target = await findUserById(targetId);
  if (!target) throw new HttpError(404, 'User tidak ditemukan');

  const updated = await updateUserRole(targetId, role);
  if (!updated) throw new HttpError(404, 'User tidak ditemukan');
  await recordAudit({
    userId: admin.id,
    aksi: 'admin.ubah_role',
    detail: { target_id: targetId, email: target.email, dari: target.role, menjadi: role },
    ip,
  });
  return updated;
}

/** Menghapus user beserta datanya (cascade di database) dan file upload terkait. */
export async function removeUser(
  admin: AuthUser,
  targetId: number,
  ip: string | null,
): Promise<void> {
  assertNotSelf(admin, targetId, 'menghapus');
  const target = await findUserById(targetId);
  if (!target) throw new HttpError(404, 'User tidak ditemukan');

  const uploadKeys = await listUserUploadKeys(targetId);
  if (!(await deleteUserById(targetId))) throw new HttpError(404, 'User tidak ditemukan');
  await removeUploadsQuietly(uploadKeys);
  await recordAudit({
    userId: admin.id,
    aksi: 'admin.hapus_user',
    detail: { target_id: targetId, email: target.email, role: target.role },
    ip,
  });
}

export function searchAllVenues(q: string | undefined): Promise<AdminVenue[]> {
  return listAllVenues(q);
}

export async function removeVenue(
  admin: AuthUser,
  venueId: number,
  ip: string | null,
): Promise<void> {
  const venue = await findVenueById(venueId);
  if (!venue) throw new HttpError(404, 'Lapangan tidak ditemukan');

  const uploadKeys = await listVenueUploadKeys(venueId);
  if (!(await deleteVenueById(venueId))) throw new HttpError(404, 'Lapangan tidak ditemukan');
  await removeUploadsQuietly(uploadKeys);
  await recordAudit({
    userId: admin.id,
    aksi: 'admin.hapus_lapangan',
    detail: { venue_id: venueId, nama: venue.nama, owner_id: venue.owner_id },
    ip,
  });
}

export function getAuditLogs(filter: { aksi?: AuditAction; limit: number }): Promise<AuditLog[]> {
  return listAuditLogs(filter);
}

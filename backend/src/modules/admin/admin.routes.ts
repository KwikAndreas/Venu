import { Router } from 'express';
import { HttpError } from '../../lib/http-error.ts';
import { optionalPositiveInt, parseIdParam, queryValue, requireString } from '../../lib/request.ts';
import { getAuthUser, requireAuth, requireRole } from '../../middleware/auth.ts';
import { ROLES, isRole } from '../../types/role.ts';
import { isAuditAction } from '../audit/audit.repository.ts';
import {
  changeUserRole,
  getAuditLogs,
  getSummary,
  removeUser,
  removeVenue,
  searchAllVenues,
  searchUsers,
} from './admin.service.ts';

const DEFAULT_LOG_LIMIT = 100;
const MAX_LOG_LIMIT = 500;

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/summary', async (_req, res) => {
  res.json(await getSummary());
});

// GET /admin/users?role=pemilik&q=demo
adminRouter.get('/users', async (req, res) => {
  const role = queryValue(req.query, 'role');
  if (role !== undefined && !isRole(role)) {
    throw new HttpError(400, `Parameter "role" harus salah satu: ${ROLES.join(', ')}`);
  }
  res.json({ users: await searchUsers({ role, q: queryValue(req.query, 'q') }) });
});

// Body: { role }
adminRouter.patch('/users/:id/role', async (req, res) => {
  const role = requireString(req.body, 'role');
  if (!isRole(role)) {
    throw new HttpError(400, `Field "role" harus salah satu: ${ROLES.join(', ')}`);
  }
  const user = await changeUserRole(
    getAuthUser(req),
    parseIdParam(req.params.id),
    role,
    req.ip ?? null,
  );
  res.json({ user });
});

adminRouter.delete('/users/:id', async (req, res) => {
  await removeUser(getAuthUser(req), parseIdParam(req.params.id), req.ip ?? null);
  res.status(204).end();
});

// GET /admin/venues?q=bandung
adminRouter.get('/venues', async (req, res) => {
  res.json({ venues: await searchAllVenues(queryValue(req.query, 'q')) });
});

adminRouter.delete('/venues/:id', async (req, res) => {
  await removeVenue(getAuthUser(req), parseIdParam(req.params.id), req.ip ?? null);
  res.status(204).end();
});

// GET /admin/audit-logs?aksi=auth.login_gagal&limit=50
adminRouter.get('/audit-logs', async (req, res) => {
  const aksi = queryValue(req.query, 'aksi');
  if (aksi !== undefined && !isAuditAction(aksi)) {
    throw new HttpError(400, 'Parameter "aksi" tidak dikenal');
  }
  const limit = Math.min(
    optionalPositiveInt(req.query, 'limit') ?? DEFAULT_LOG_LIMIT,
    MAX_LOG_LIMIT,
  );
  res.json({ logs: await getAuditLogs({ aksi, limit }) });
});

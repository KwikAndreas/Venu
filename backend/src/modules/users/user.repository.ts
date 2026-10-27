import { pool } from '../../db/pool.ts';
import type { Role } from '../../types/role.ts';

export type PublicUser = {
  id: number;
  nama: string;
  email: string;
  role: Role;
  created_at: Date;
};

export type UserWithPassword = PublicUser & { password_hash: string };

export type NewUser = {
  nama: string;
  email: string;
  passwordHash: string;
  role: Role;
};

const PUBLIC_COLUMNS = 'id, nama, email, role, created_at';

export async function findUserByEmail(email: string): Promise<UserWithPassword | undefined> {
  const { rows } = await pool.query<UserWithPassword>(
    `SELECT ${PUBLIC_COLUMNS}, password_hash FROM users WHERE email = $1`,
    [email],
  );
  return rows[0];
}

export async function findUserById(id: number): Promise<PublicUser | undefined> {
  const { rows } = await pool.query<PublicUser>(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0];
}

export async function insertUser(user: NewUser): Promise<PublicUser> {
  const { rows } = await pool.query<PublicUser>(
    `INSERT INTO users (nama, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [user.nama, user.email, user.passwordHash, user.role],
  );
  const created = rows[0];
  if (!created) throw new Error('INSERT users tidak mengembalikan baris');
  return created;
}

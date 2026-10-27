export type WhereBuilder = {
  /** Menambah kondisi; `toSql` menerima placeholder ($1, $2, ...) untuk `value`. */
  add: (toSql: (placeholder: string) => string, value: unknown) => void;
  /** Menambah kondisi SQL tetap yang tidak membawa nilai baru (mis. memakai $1 dari initialParams). */
  raw: (sql: string) => void;
  /** Nilai untuk dikirim sebagai parameter query, urut sesuai placeholder. */
  params: unknown[];
  /** Klausa `WHERE ... AND ...`, atau string kosong bila tidak ada kondisi. */
  clause: () => string;
};

/**
 * Penyusun klausa WHERE dinamis. Nilai selalu dikirim sebagai parameter ($n), tidak pernah
 * digabung ke teks SQL. `initialParams` dipakai bila query sudah punya parameter lain di depan.
 */
export function createWhereBuilder(initialParams: unknown[] = []): WhereBuilder {
  const conditions: string[] = [];
  const params = [...initialParams];

  return {
    params,
    add: (toSql, value) => {
      params.push(value);
      conditions.push(toSql(`$${params.length}`));
    },
    raw: (sql) => {
      conditions.push(sql);
    },
    clause: () => (conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''),
  };
}

/** Escape karakter wildcard LIKE (% dan _) agar dicari sebagai teks biasa. */
export function likePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

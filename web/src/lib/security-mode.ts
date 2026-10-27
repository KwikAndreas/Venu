/**
 * Mode keamanan web, dibaca dari VITE_SECURITY_MODE saat build/dev. Vite mengganti
 * `import.meta.env.VITE_SECURITY_MODE` dengan teks tetap, sehingga cabang kode untuk mode
 * yang tidak dipilih ikut dibuang dari hasil build (dead code elimination).
 * Kosong atau nilai lain = "after" (aman).
 */
export const IS_BEFORE_MODE = import.meta.env.VITE_SECURITY_MODE === 'before';

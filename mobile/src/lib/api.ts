// Klien HTTP untuk backend Venu (versi mobile dari web/src/lib/api.ts).
import { API_URL } from './config';
import { storage } from './storage';

const TOKEN_KEY = 'venu.token';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Token disimpan di storage perangkat (SecureStore) dan disalin ke memori agar setiap request
 * tidak perlu membaca storage lagi. `load()` dipanggil sekali saat aplikasi dibuka.
 */
let cachedToken: string | null = null;

export const tokenStore = {
  load: async (): Promise<string | null> => {
    cachedToken = await storage.get(TOKEN_KEY);
    return cachedToken;
  },
  save: async (token: string): Promise<void> => {
    cachedToken = token;
    await storage.set(TOKEN_KEY, token);
  },
  clear: async (): Promise<void> => {
    cachedToken = null;
    await storage.remove(TOKEN_KEY);
  },
};

let unauthorizedHandler: (() => void) | undefined;

/** Dipanggil saat API menjawab 401 untuk request bertoken (token tidak valid/kedaluwarsa). */
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  json?: unknown;
  form?: FormData;
  signal?: AbortSignal;
};

function messageFrom(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const { message } = data as { message: unknown };
    if (typeof message === 'string') return message;
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = cachedToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: FormData | string | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    // Penyebab asli (mis. body tidak didukung expo/fetch) hanya dicatat saat development.
    if (__DEV__) console.warn(`Request ${path} gagal:`, error);
    throw new ApiError(0, `Tidak dapat terhubung ke server (${API_URL}).`);
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    if (response.status === 401 && token) unauthorizedHandler?.();
    // Hanya pesan yang ditampilkan; detail lain dari server (mis. stack trace) diabaikan.
    throw new ApiError(response.status, messageFrom(data));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, json?: unknown) => request<T>(path, { method: 'POST', json }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', form }),
};

/**
 * Sumber gambar yang butuh login (mis. bukti bayar): `expo-image` mengirim header token sendiri,
 * jadi file tidak perlu dibuat publik.
 */
export function authorizedSource(path: string): { uri: string; headers: Record<string, string> } {
  return {
    uri: `${API_URL}${path}`,
    headers: cachedToken ? { Authorization: `Bearer ${cachedToken}` } : {},
  };
}

export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError(0, 'Terjadi kesalahan. Silakan coba lagi.');
}

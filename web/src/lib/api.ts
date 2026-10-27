// Klien HTTP untuk backend Venu. Saat development, Vite meneruskan /api ke http://localhost:4000.
const API_BASE = '/api';
const TOKEN_KEY = 'venu.token';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

let unauthorizedHandler: (() => void) | undefined;

/** Dipanggil saat API menjawab 401 untuk request bertoken (token tidak valid/kedaluwarsa). */
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
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

async function send(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Periksa apakah backend menyala.');
  }

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    if (response.status === 401 && token) unauthorizedHandler?.();
    // Hanya pesan yang ditampilkan; detail lain dari server (mis. stack trace) diabaikan.
    throw new ApiError(response.status, messageFrom(data));
  }
  return response;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, json?: unknown) => request<T>(path, { method: 'POST', json }),
  patch: <T>(path: string, json: unknown) => request<T>(path, { method: 'PATCH', json }),
  put: <T>(path: string, json: unknown) => request<T>(path, { method: 'PUT', json }),
  delete: (path: string) => request<undefined>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', form }),
  /** File yang butuh token (mis. bukti bayar) diambil sebagai Blob, lalu ditampilkan lewat object URL. */
  blob: async (path: string): Promise<Blob> => (await send(path, {})).blob(),
};

export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError(0, 'Terjadi kesalahan. Silakan coba lagi.');
}
